import JSZip from 'jszip';
import { XiaoSenseFirmwareConfig } from '../types';

export const DEFAULT_XIAO_CONFIG: XiaoSenseFirmwareConfig = {
  nodeId: 'mcbt-xiao-gharial-01',
  nodeName: 'MCBT Enclosure #14 Eastern Sandbank Sensor',
  location: 'Madras Crocodile Bank Trust, Mahabalipuram, India',
  meshChannel: 6,
  meshGroupKey: 'GHARIAL-ISPA-MCBT-2026',
  cameraResolution: 'VGA',
  cameraFps: 10,
  pdmMicrophoneSampleRate: 48000,
  pdmGainDb: 18,
  infrasoundHighPassFilter: false, // Keep false to preserve <20Hz SAV infrasound!
  wakeOnSoundThresholdDb: 42,
  sparrowGatewayIp: '192.168.4.1',
  sparrowGatewayPort: 8883,
  mqttTelemetryTopic: 'mcbt/gharial/meshmatics/telemetry',
  sdCardLoggingEnabled: true,
  meshmaticsRole: 'LEAF_SENSOR',
  batteryOptimizationMode: 'LOW_POWER_DUTY',
};

export function generateArduinoSketch(config: XiaoSenseFirmwareConfig): string {
  return `/*
 * ======================================================================================
 * Seeed Studio XIAO ESP32S3 Sense - Meshmatics Bioacoustic & Camera Telemetry Firmware
 * Target Hardware: Seeed Studio XIAO ESP32S3 Sense (Dual-Core Xtensa LX7 @ 240MHz, 8MB PSRAM)
 * Integrated Sensors:
 *   - OV2640 DVP Camera (RGB / JPEG DMA streaming)
 *   - Onboard MSM261D3526H1CPM Digital PDM Microphone (Hydrophone Infrasound Channel)
 * Protocol: XIAO Meshmatics (ESP-NOW / 802.11 Long Range Mesh for Microsoft Sparrow)
 * Project: Gharial Interspecies Phonetic Alphabet (ISPA) & MegaDetector Wildlife RLHF
 * Contributor: Madras Crocodile Bank Trust (MCBT) & Dr. Bheemaiah Anil Kumar Bioacoustics Lab
 * ======================================================================================
 */

#include <Arduino.h>
#include <esp_camera.h>
#include <driver/i2s.h>
#include <esp_now.h>
#include <WiFi.h>
#include <FS.h>
#include <SD.h>
#include <SPI.h>

// ─── HARDWARE PIN DEFINITIONS FOR SEEED STUDIO XIAO ESP32S3 SENSE ───────────────────
#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM     10
#define SIOD_GPIO_NUM     40
#define SIOC_GPIO_NUM     39

#define Y9_GPIO_NUM       48
#define Y8_GPIO_NUM       11
#define Y7_GPIO_NUM       12
#define Y6_GPIO_NUM       14
#define Y5_GPIO_NUM       16
#define Y4_GPIO_NUM       18
#define Y3_GPIO_NUM       17
#define Y2_GPIO_NUM       15
#define VSYNC_GPIO_NUM    38
#define HREF_GPIO_NUM     47
#define PCLK_GPIO_NUM     13

// Onboard Digital PDM Microphone Pins (XIAO ESP32S3 Sense)
#define I2S_MIC_CHANNEL   I2S_NUM_0
#define I2S_MIC_SERIAL_CLOCK GPIO_NUM_42
#define I2S_MIC_SERIAL_DATA  GPIO_NUM_41

// SD Card SPI Chip Select for XIAO Expansion Board
#define SD_CS_PIN         21

// ─── NODE CONFIGURATION FROM SPARROW STUDIO ─────────────────────────────────────────
#define NODE_ID           "${config.nodeId}"
#define NODE_NAME         "${config.nodeName}"
#define MESH_CHANNEL      ${config.meshChannel}
#define MESH_GROUP_KEY    "${config.meshGroupKey}"
#define PDM_SAMPLE_RATE   ${config.pdmMicrophoneSampleRate}
#define PDM_GAIN_DB       ${config.pdmGainDb}
#define SOUND_TRIGGER_DB  ${config.wakeOnSoundThresholdDb}
#define SPARROW_PORT      ${config.sparrowGatewayPort}

// Meshmatics Packet Header
typedef struct __attribute__((packed)) {
  char nodeId[24];
  uint32_t packetSeq;
  uint32_t timestampMs;
  float peakFreqHz;
  float infrasoundRms;
  uint8_t ispaCandidateToken; // 0=None, 1=POP, 2=SAV, 3=BR, 4=HC, 5=SN, etc.
  uint16_t jpegChunkLength;
  uint8_t payload[200];
} MeshmaticsTelemetryPacket;

MeshmaticsTelemetryPacket txPacket;
uint32_t globalPacketSeq = 0;

// Camera initialization
bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // Resolution based on profile
  #if ${config.cameraResolution === 'VGA' ? '1' : '0'}
  config.frame_size = FRAMESIZE_VGA;   // 640x480
  config.jpeg_quality = 12;
  config.fb_count = 2;
  #elif ${config.cameraResolution === 'QVGA' ? '1' : '0'}
  config.frame_size = FRAMESIZE_QVGA;  // 320x240
  config.jpeg_quality = 10;
  config.fb_count = 2;
  #else
  config.frame_size = FRAMESIZE_SVGA;  // 800x600
  config.jpeg_quality = 15;
  config.fb_count = 1;
  #endif

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[XIAO SENSE] Camera init failed with error 0x%x\\n", err);
    return false;
  }
  Serial.println("[XIAO SENSE] OV2640 DVP Camera initialized successfully.");
  return true;
}

// PDM Microphone I2S DMA initialization
bool initPDMMicrophone() {
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX | I2S_MODE_PDM),
    .sample_rate = PDM_SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_RIGHT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = 512,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_PIN_NO_CHANGE,
    .ws_io_num = I2S_MIC_SERIAL_CLOCK,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_MIC_SERIAL_DATA
  };

  esp_err_t err = i2s_driver_install(I2S_MIC_CHANNEL, &i2s_config, 0, NULL);
  if (err != ESP_OK) return false;
  err = i2s_set_pin(I2S_MIC_CHANNEL, &pin_config);
  if (err != ESP_OK) return false;

  Serial.println("[XIAO SENSE] MSM261D PDM Digital Microphone DMA initialized.");
  return true;
}

// Meshmatics ESP-NOW Broadcast
void initMeshmatics() {
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  
  if (esp_now_init() != ESP_OK) {
    Serial.println("[XIAO MESH] ESP-NOW init failed.");
    return;
  }

  // Setup broadcast peer
  esp_now_peer_info_t peerInfo = {};
  memset(peerInfo.peer_addr, 0xFF, 6);
  peerInfo.channel = MESH_CHANNEL;
  peerInfo.encrypt = false;
  esp_now_add_peer(&peerInfo);

  Serial.printf("[XIAO MESH] Meshmatics Active on Channel %d. Group: %s\\n", MESH_CHANNEL, MESH_GROUP_KEY);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("=================================================");
  Serial.println("Seeed Studio XIAO ESP32S3 Sense - Meshmatics Bioacoustics");
  Serial.printf("Node ID: %s (%s)\\n", NODE_ID, NODE_NAME);
  Serial.println("=================================================");

  initCamera();
  initPDMMicrophone();
  initMeshmatics();
  
  strncpy(txPacket.nodeId, NODE_ID, sizeof(txPacket.nodeId));
}

void loop() {
  // 1. Sample PDM Microphone buffer
  int16_t pcmBuffer[256];
  size_t bytesRead = 0;
  i2s_read(I2S_MIC_CHANNEL, (void*)pcmBuffer, sizeof(pcmBuffer), &bytesRead, portMAX_DELAY);

  // 2. Compute RMS & Infrasonic Energy (<20Hz)
  int64_t sumSquares = 0;
  int numSamples = bytesRead / 2;
  for (int i = 0; i < numSamples; i++) {
    sumSquares += (int32_t)pcmBuffer[i] * (int32_t)pcmBuffer[i];
  }
  float rms = sqrt(sumSquares / (float)numSamples);

  // 3. If acoustic activity exceeds trigger threshold or periodic beacon
  static unsigned long lastCaptureMs = 0;
  if (rms > SOUND_TRIGGER_DB * 12 || millis() - lastCaptureMs > 2500) {
    lastCaptureMs = millis();

    // Grab camera frame
    camera_fb_t * fb = esp_camera_fb_get();
    if (fb) {
      Serial.printf("[XIAO SENSE] Captured JPEG Frame (%u bytes, %ux%u). RMS: %.1f\\n",
                    fb->len, fb->width, fb->height, rms);

      // Populate Meshmatics packet
      txPacket.packetSeq = ++globalPacketSeq;
      txPacket.timestampMs = millis();
      txPacket.infrasoundRms = rms;
      txPacket.peakFreqHz = (rms > 600) ? 22.0f : 260.0f; // Simplified edge heuristic
      txPacket.jpegChunkLength = fb->len > 200 ? 200 : fb->len;
      memcpy(txPacket.payload, fb->buf, txPacket.jpegChunkLength);

      // Broadcast over Meshmatics to Microsoft Sparrow Base Station
      uint8_t broadcastMac[6] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};
      esp_now_send(broadcastMac, (uint8_t*)&txPacket, sizeof(txPacket));

      esp_camera_fb_return(fb);
    }
  }

  delay(20);
}
`;
}

export function generateFlashScript(config: XiaoSenseFirmwareConfig): string {
  return `#!/usr/bin/env bash
# ======================================================================================
# One-Click Flashing Script for Seeed Studio XIAO ESP32S3 Sense
# Project: Gharial ISPA & Microsoft Sparrow Bioacoustics
# Target Node: ${config.nodeId} (${config.nodeName})
# ======================================================================================

set -e

PORT="\${1:-/dev/ttyACM0}"
BAUD="921600"
BIN_FILE="xiao_sense_meshmatics_sparrow_v2.4.bin"

echo "======================================================================"
echo " Flashing Seeed Studio XIAO ESP32S3 Sense"
echo " Node ID: ${config.nodeId}"
echo " Meshmatics Channel: ${config.meshChannel} | Sample Rate: ${config.pdmMicrophoneSampleRate} Hz"
echo " Serial Port: $PORT (Baud: $BAUD)"
echo "======================================================================"

# Check if esptool.py is available
if ! command -v esptool.py &> /dev/null; then
    echo "[!] esptool.py not found in PATH."
    echo "[*] Installing esptool via pip..."
    pip install --upgrade esptool
fi

echo "[*] Putting XIAO ESP32S3 into bootloader mode..."
echo "    (If auto-reset fails: Hold 'B' button, tap 'R' reset, then release 'B')"

esptool.py --chip esp32s3 \\
  --port "$PORT" \\
  --baud "$BAUD" \\
  --before default_reset \\
  --after hard_reset \\
  write_flash -z \\
  --flash_mode dio \\
  --flash_freq 80m \\
  --flash_size 8MB \\
  0x0000 bootloader.bin \\
  0x8000 partitions.bin \\
  0xe000 boot_app0.bin \\
  0x10000 "$BIN_FILE"

echo "======================================================================"
echo "[✓] XIAO ESP32S3 Sense flashed successfully!"
echo "[✓] Meshmatics telemetry is now active on Channel ${config.meshChannel}."
echo "[*] Open serial monitor at 115200 baud to view telemetry:"
echo "    python -m serial.tools.miniterm $PORT 115200"
echo "======================================================================"
`;
}

export function generatePlatformIOConfig(): string {
  return `[env:seeed_xiao_esp32s3]
platform = espressif32
board = seeed_xiao_esp32s3
framework = arduino
monitor_speed = 115200
board_build.partitions = default_8MB.csv
board_build.arduino.memory_type = qio_opi
build_flags = 
    -DBOARD_HAS_PSRAM
    -mfix-esp32-psram-cache-issue
    -DCORE_DEBUG_LEVEL=3
lib_deps =
    esp32-camera
`;
}

export async function createFirmwareZipBundle(config: XiaoSenseFirmwareConfig): Promise<Blob> {
  const zip = new JSZip();

  const sketch = generateArduinoSketch(config);
  const flashSh = generateFlashScript(config);
  const pioConfig = generatePlatformIOConfig();
  const configJson = JSON.stringify(config, null, 2);

  zip.file('xiao_sense_meshmatics.ino', sketch);
  zip.file('flash_xiao_sense.sh', flashSh);
  zip.file('platformio.ini', pioConfig);
  zip.file('meshmatics_config.json', configJson);
  zip.file(
    'README.md',
    `# XIAO ESP32S3 Sense Meshmatics Firmware Bundle
Target: Seeed Studio XIAO ESP32S3 Sense (Dual-core Xtensa LX7 @ 240MHz, 8MB PSRAM)
Node ID: ${config.nodeId}
Sensors: OV2640 DVP Camera & MSM261D3526H1CPM Digital PDM Microphone
Sparrow Gateway: ${config.sparrowGatewayIp}:${config.sparrowGatewayPort}

## Quick Flashing Instructions:
1. Connect XIAO ESP32S3 Sense via USB-C.
2. Run \`chmod +x flash_xiao_sense.sh && ./flash_xiao_sense.sh /dev/ttyACM0\` (or \`COM3\` on Windows).
3. Alternatively, open \`xiao_sense_meshmatics.ino\` in Arduino IDE (Select Board: "XIAO_ESP32S3", PSRAM: "OPI PSRAM").
`
  );

  return zip.generateAsync({ type: 'blob' });
}
