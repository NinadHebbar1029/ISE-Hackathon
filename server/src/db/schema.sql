-- VerboCare Database Schema

CREATE DATABASE IF NOT EXISTS verbocare;
USE verbocare;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('patient', 'worker', 'doctor', 'admin') NOT NULL,
  areas JSON NULL,
  languages JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Areas table
CREATE TABLE IF NOT EXISTS areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  created_by_user_id INT NOT NULL,
  area_id INT NULL,
  description TEXT NOT NULL,
  language VARCHAR(50) NOT NULL DEFAULT 'en',
  status ENUM('new', 'assigned', 'in_progress', 'awaiting_doctor', 'completed', 'closed') NOT NULL DEFAULT 'new',
  patient_name VARCHAR(255) NULL,
  patient_age INT NULL,
  location VARCHAR(255) NULL,
  audio_url VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
  INDEX idx_patient (patient_id),
  INDEX idx_status (status),
  INDEX idx_area (area_id),
  INDEX idx_created_at (created_at)
);

-- Case triage table
CREATE TABLE IF NOT EXISTS case_triage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  urgency_level ENUM('critical', 'urgent', 'moderate', 'routine') NOT NULL,
  structured_symptoms JSON NOT NULL,
  risk_flags JSON NOT NULL,
  ai_model VARCHAR(100) NOT NULL,
  summary TEXT NULL,
  translated_description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  INDEX idx_case (case_id),
  INDEX idx_urgency (urgency_level)
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  worker_id INT NULL,
  doctor_id INT NULL,
  status ENUM('pending', 'accepted', 'in_progress', 'completed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_case (case_id),
  INDEX idx_worker (worker_id),
  INDEX idx_doctor (doctor_id),
  INDEX idx_status (status)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  author_id INT NOT NULL,
  author_role ENUM('patient', 'worker', 'doctor', 'admin', 'system') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_case (case_id),
  INDEX idx_created_at (created_at)
);
