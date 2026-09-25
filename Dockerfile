# =============================================================
# Stage 1: Build application with Maven and JDK 17
# =============================================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy pom.xml and cache dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build WAR artifact
COPY src ./src
RUN mvn clean package -DskipTests

# =============================================================
# Stage 2: Deploy to Apache Tomcat 10.1 runtime
# =============================================================
FROM tomcat:10.1-jdk17-temurin

# Remove default ROOT application to serve our app at the root context /
RUN rm -rf /usr/local/tomcat/webapps/ROOT /usr/local/tomcat/webapps/ROOT.war

# Copy the built WAR file to Tomcat webapps as ROOT.war
COPY --from=builder /build/target/location-weather-app.war /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080

CMD ["catalina.sh", "run"]
