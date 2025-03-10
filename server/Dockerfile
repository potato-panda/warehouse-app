FROM eclipse-temurin:21 AS build-stage

WORKDIR /app

# Copy the Maven wrapper files and project files
COPY .mvn /app/.mvn
COPY mvnw /app/mvnw
COPY pom.xml /app/

COPY src ./src

RUN chmod +x ./mvnw

RUN ./mvnw package spring-boot:repackage -DskipTests

COPY target/*.jar app.jar

RUN java -Djarmode=tools -jar app.jar extract --layers --destination extracted

FROM eclipse-temurin:21-jre-alpine AS runtime-stage

WORKDIR /app

COPY --from=build-stage /app/extracted/dependencies/ ./dependencies/
COPY --from=build-stage /app/extracted/spring-boot-loader/ ./spring-boot-loader/
COPY --from=build-stage /app/extracted/snapshot-dependencies/ ./snapshot-dependencies/
COPY --from=build-stage /app/extracted/application/ ./application/
COPY --from=build-stage /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
