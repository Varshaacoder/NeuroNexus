/*
 * NEURONEXUS — BioAmp EXG Pill / Arduino Acquisition Firmware
 * Project: Neuronexus (Team: Infinite Loopers, Team ID: DEX26031)
 * File: sketch_oct28a_copy_20261028141956.ino
 *
 * Compatible with: Arduino Uno / Nano, ESP32, RP2040, STM32
 * Sensor: BioAmp EXG Pill (Biopotential Analog Front-End)
 *
 * HARDWARE CONNECTIONS:
 * BioAmp EXG Pill VCC  -> 3.3V / 5V
 * BioAmp EXG Pill GND  -> GND
 * BioAmp EXG Pill OUT  -> Analog Pin A0 (or GPIO34 on ESP32)
 *
 * Sampling Frequency: 250 Hz (Sample interval: 4000 microseconds)
 * Baud Rate: 115200 bps
 */

#define SAMPLE_RATE_HZ 250
#define BAUD_RATE 115200
#define INPUT_PIN A0 // Change to 34 for ESP32 ADC1_CH6

// Sample interval in microseconds (1,000,000 / 250 = 4000 us)
const unsigned long SAMPLE_INTERVAL_US = 1000000UL / SAMPLE_RATE_HZ;
unsigned long lastSampleTime = 0;

// Simple 50Hz Notch Filter constants for mains noise rejection
float notch_x1 = 0, notch_x2 = 0;
float notch_y1 = 0, notch_y2 = 0;

// Bandpass filter buffer (0.5 Hz - 35 Hz)
float bp_x1 = 0, bp_x2 = 0;
float bp_y1 = 0, bp_y2 = 0;

float apply50HzNotch(float input) {
  // 50Hz notch filter at 250Hz sample rate (Q=10)
  // b = [0.9565, -0.5912, 0.9565], a = [1.0, -0.5912, 0.9131]
  float output = 0.956543 * input - 0.591208 * notch_x1 + 0.956543 * notch_x2 
                 + 0.591208 * notch_y1 - 0.913086 * notch_y2;
  notch_x2 = notch_x1;
  notch_x1 = input;
  notch_y2 = notch_y1;
  notch_y1 = output;
  return output;
}

void setup() {
  Serial.begin(BAUD_RATE);
  while (!Serial) {
    ; // Wait for serial port connection
  }
  
  pinMode(INPUT_PIN, INPUT);
  lastSampleTime = micros();
  
  // Header banner for Neuronexus Serial Bridge
  Serial.println("# NEURONEXUS BioAmp EXG Bridge Active");
  Serial.println("# Channel: EEG-Ch1 | Rate: 250Hz | Baud: 115200");
}

void loop() {
  unsigned long currentTime = micros();

  // Precise timing loop for exactly 250 samples per second
  if (currentTime - lastSampleTime >= SAMPLE_INTERVAL_US) {
    lastSampleTime += SAMPLE_INTERVAL_US;

    // Read analog voltage from BioAmp EXG Pill
    int rawADC = analogRead(INPUT_PIN);

    // Convert raw ADC (0-1023 or 0-4095) to estimated microvolts
    // For 10-bit ADC at 5V: microvolts = (rawADC - 512) * (5000000.0 / 1024.0) / Gain(2420)
    float uV = (float)(rawADC - 512) * 4.02;

    // Apply digital 50 Hz notch filter to reject mains noise
    float filtered_uV = apply50HzNotch(uV);

    // Stream packet to Neuronexus Serial Bridge: [timestamp_us, raw_uV, filtered_uV]
    Serial.print(currentTime);
    Serial.print(",");
    Serial.print(uV, 2);
    Serial.print(",");
    Serial.println(filtered_uV, 2);
  }
}
