package com.example.tripbudget;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Properties;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TripBudgetApplication {

	public static void main(String[] args) {
		createDatabaseIfNotExist();
		SpringApplication.run(TripBudgetApplication.class, args);
	}

	private static void createDatabaseIfNotExist() {
		Properties props = new Properties();
		try (InputStream is = TripBudgetApplication.class.getClassLoader().getResourceAsStream("application.properties")) {
			if (is != null) {
				props.load(is);
			}
		} catch (Exception e) {
			System.err.println("Failed to load application.properties: " + e.getMessage());
			return;
		}

		String urlProp = props.getProperty("spring.datasource.url", "jdbc:postgresql://localhost:5432/tripbudget");
		String username = props.getProperty("spring.datasource.username", "postgres");
		String password = props.getProperty("spring.datasource.password", "postgres");

		// Extract host, port and dbName from jdbc:postgresql://host:port/dbName
		String dbName = "tripbudget";
		String serverUrl = "jdbc:postgresql://localhost:5432/postgres"; // fallback default
		
		try {
			if (urlProp.startsWith("jdbc:postgresql://")) {
				String cleanUrl = urlProp.substring("jdbc:postgresql://".length());
				int slashIdx = cleanUrl.indexOf('/');
				if (slashIdx != -1) {
					String hostPort = cleanUrl.substring(0, slashIdx);
					dbName = cleanUrl.substring(slashIdx + 1);
					// Strip query parameters if any
					int questionIdx = dbName.indexOf('?');
					if (questionIdx != -1) {
						dbName = dbName.substring(0, questionIdx);
					}
					serverUrl = "jdbc:postgresql://" + hostPort + "/postgres";
				}
			}
		} catch (Exception e) {
			System.err.println("Error parsing database URL: " + e.getMessage());
		}

		try (Connection conn = DriverManager.getConnection(serverUrl, username, password);
			 Statement stmt = conn.createStatement()) {
			
			// Check if database exists
			String checkQuery = "SELECT 1 FROM pg_database WHERE datname = '" + dbName + "'";
			try (ResultSet rs = stmt.executeQuery(checkQuery)) {
				if (!rs.next()) {
					System.out.println("Database " + dbName + " does not exist. Creating it...");
					stmt.executeUpdate("CREATE DATABASE " + dbName);
					System.out.println("Database " + dbName + " successfully created.");
				} else {
					System.out.println("Database " + dbName + " already exists.");
				}
			}
		} catch (Exception e) {
			System.err.println("Failed to check/create database: " + e.getMessage());
		}
	}
}

