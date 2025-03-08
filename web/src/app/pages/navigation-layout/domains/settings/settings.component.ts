import {Component, inject, OnInit} from '@angular/core';
import {SettingsService} from '../../../../services/settings.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ResolvedData} from './settings.resolver';
import {TuiAlertService, TuiAppearance, TuiButton, TuiError, TuiLoader, TuiTextfield, TuiTitle} from '@taiga-ui/core';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {AsyncPipe, NgForOf} from '@angular/common';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-settings',
  imports: [
    ReactiveFormsModule,
    TuiTextfield,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiError,
    TuiLoader,
    TuiButton,
    RouterLink,
    TuiTitle,
    TuiHeader,
    TuiForm,
    TuiCardLarge,
    TuiAppearance,
    FormsModule,
    NgForOf
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  protected inProgress = false;
  protected settingsArray: FormArray<FormGroup<{
    id: FormControl<number>,
    name: FormControl<string>,
    key: FormControl<string>,
    value: FormControl<string | null>
  }>> = new FormArray<FormGroup>([]);
  protected form = new FormGroup({
    settings: this.settingsArray
  });
  protected alerts = inject(TuiAlertService);

  constructor(private route: ActivatedRoute,
              private settingsService: SettingsService) {
  }

  ngOnInit(): void {
    if (this.route.snapshot.data?.['resolved']) {
      const {settings} = this.route.snapshot.data['resolved'] as ResolvedData;
      const filteredSettings = settings.filter(s => s.key !== 'default');
      for (const setting of filteredSettings) {
        this.settingsArray.push(new FormGroup({
          id: new FormControl<number>(setting.id, {nonNullable: true, validators: [Validators.required]}),
          name: new FormControl<string>(setting.name, {nonNullable: true, validators: [Validators.required]}),
          key: new FormControl<string>(setting.key, {nonNullable: true, validators: [Validators.required]}),
          value: new FormControl<string | null>(setting.value)
        }));
      }
    }
  }

  save() {
    this.inProgress = true;

    let changeRequests = [];
    for (const fg of this.settingsArray.controls) {
      if (fg.dirty && fg.valid) {
        const values = fg.value;
        const request = this.settingsService.updateSetting({
          id: values.id!,
          name: values.name!,
          key: values.key!,
          value: values.value!
        });
        changeRequests.push(request);
      }
    }

    if (changeRequests.length == 0) {
      this.inProgress = false;
      return;
    }

    forkJoin(changeRequests).pipe().subscribe({
      error: err => {
        this.alerts.open(context => {
          },
          {
            appearance: 'negative',
            label: 'Failed to save settings. Please try again later.'
          }).subscribe();
        this.inProgress = false;
      },
      next: value => {
        this.alerts.open(context => {
          },
          {
            appearance: 'positive',
            label: 'Successfully saved settings',
          }).subscribe();
        this.inProgress = false;
      },
      complete: () => {
        this.inProgress = false;
      }
    });

  }

}
