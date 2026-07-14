# --- Stage 1: Build ---
FROM maven:3.8.8-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy pom.xml to cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build the application jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# --- Stage 2: Runtime ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/target/tripbudget-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Run the spring boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
