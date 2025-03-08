package com.warehouse.server.init;

import com.warehouse.server.entities.Authority;
import com.warehouse.server.entities.Setting;
import com.warehouse.server.entities.User;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.exceptions.NotFoundException;
import com.warehouse.server.repositories.AuthorityRepository;
import com.warehouse.server.repositories.SettingRepository;
import com.warehouse.server.repositories.UserRepository;
import com.warehouse.server.services.SettingService;
import com.warehouse.server.services.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements ApplicationListener<ApplicationReadyEvent> {

    private final AuthorityRepository authorityRepository;
    private final UserRepository      userRepository;
    private final UserService         userService;
    private final SettingRepository   settingRepository;

    @Autowired
    public DataInitializer(AuthorityRepository authorityRepository,
                           UserRepository userRepository,
                           UserService userService,
                           SettingRepository settingRepository) {
        this.authorityRepository = authorityRepository;
        this.userRepository      = userRepository;
        this.userService         = userService;
        this.settingRepository   = settingRepository;
    }

    @Transactional
    public void init() {
        try {
            createInitialAuthorities();
            createInitialUsers();
            createInitialSettings();
        } catch (Exception | InvalidInputException | NotFoundException e) {
            throw new RuntimeException(e);
        }
    }

    void createInitialAuthorities() {
        if (!authorityRepository.existsByAuthority("ROLE_ADMIN")) {
            authorityRepository.save(new Authority("ROLE_ADMIN"));
        }
        if (!authorityRepository.existsByAuthority("ROLE_USER")) {
            authorityRepository.save(new Authority("ROLE_USER"));
        }
    }

    void createInitialUsers() throws InvalidInputException, NotFoundException {
        Authority adminRole = authorityRepository.findByAuthority("ROLE_ADMIN").orElseThrow();
        Authority userRole  = authorityRepository.findByAuthority("ROLE_USER").orElseThrow();

        if (!userRepository.existsByUsername("admin")) {
            userService.createUser(new User("admin", "admin", List.of(adminRole), true));
        }
        if (!userRepository.existsByUsername("user")) {
            userService.createUser(new User("user", "user", List.of(userRole), true));
        }
    }

    void createInitialSettings() {
        setDefaultIfNotExists("App Name", SettingService.KEY.APP_NAME, "Warehouse App", true);
        setDefaultIfNotExists("Company Name", SettingService.KEY.COMPANY_NAME, "Warehouse App", true);
        setDefaultIfNotExists("TIN", SettingService.KEY.TIN, "", true);
        setDefaultIfNotExists("Contact", SettingService.KEY.CONTACT, "123-456-7890", true);
        setDefaultIfNotExists("Address", SettingService.KEY.ADDRESS, "", true);
        setDefaultIfNotExists("default", SettingService.KEY.DEFAULT, "default", false);
    }

    void setDefaultIfNotExists(String name, SettingService.KEY key, String defaultValue, Boolean admin) {
        if (!settingRepository.existsSettingByKey(key.getValue())) {
            settingRepository.save(new Setting(null, name, key.getValue(), defaultValue, admin));
        }
    }

    @Transactional
    @Override
    public void onApplicationEvent(@NonNull ApplicationReadyEvent event) {
        this.init();
    }

    @Override
    public boolean supportsAsyncExecution() {
        return ApplicationListener.super.supportsAsyncExecution();
    }
}
