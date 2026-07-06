using System;
using Microsoft.Extensions.Logging;

namespace LibrarySystem.Worker.Services
{
    public class RfidHardwareController
    {
        private readonly ILogger<RfidHardwareController> _logger;

        public RfidHardwareController(ILogger<RfidHardwareController> logger)
        {
            _logger = logger;
        }

        public void ToggleEasBit(string barcode, bool enableSecurity)
        {
            // Trong thực tế, hệ thống sẽ gửi lệnh serial port (COM/RS232) hoặc gọi SDK của máy đọc RFID (e.g. 3M, Nedap)
            // để thay đổi bit EAS (Electronic Article Surveillance) hoặc AFI (Application Family Identifier).
            var status = enableSecurity ? "ON" : "OFF";
            
            _logger.LogInformation($"[RFID HARDWARE] Sending command to RFID pad for barcode '{barcode}'...");
            _logger.LogInformation($"[RFID HARDWARE] Setting EAS/AFI Security Flag to: {status}");
            _logger.LogInformation($"[RFID HARDWARE] Operation completed. Patron can now walk through security gates.");
        }
    }
}
