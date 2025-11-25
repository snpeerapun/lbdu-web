using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.Linq;
using System.Reflection.PortableExecutable;
using System.Text;
using System.Threading.Tasks;
using PdfSharpCore.Pdf;
using PdfSharpCore.Pdf.IO;
namespace LBDUSite.Common
{
    public static class Utility
    {
        public static async Task<byte[]> CombinePdfFilesAsync(List<byte[]> pdfBytesList)
        {
            using (var outputDocument = new PdfDocument())
            {
                foreach (var pdfBytes in pdfBytesList)
                {
                    using (var stream = new MemoryStream(pdfBytes))
                    {
                        var inputDocument = PdfReader.Open(stream, PdfDocumentOpenMode.Import);
                        for (int i = 0; i < inputDocument.PageCount; i++)
                        {
                            var page = inputDocument.Pages[i];
                            outputDocument.AddPage(page);
                        }
                    }
                }

                using (var outputStream = new MemoryStream())
                {
                    outputDocument.Save(outputStream);
                    return outputStream.ToArray();
                }
            }
        }
        public static void CreateZipArchive(string folder, string outputZipFilePath)
        {
            // Create a new zip archive
            using (FileStream zipFileStream = new FileStream(outputZipFilePath, FileMode.Create))
            {
                using (ZipArchive archive = new ZipArchive(zipFileStream, ZipArchiveMode.Create))
                {
                    // Get all files in the specified folder

                    if (!Directory.Exists(folder)) { 
                        Directory.CreateDirectory(folder);
                    }
                     
                    string[] files = Directory.GetFiles(folder);

                    foreach (string filePath in files)
                    {
                        // Add each file to the zip archive
                        string fileName = Path.GetFileName(filePath);
                        archive.CreateEntryFromFile(filePath, fileName);
                    }
                }
            }
        }
        public static void SaveToFile(byte[] pdfBytes, string filePath)
        {
            using (FileStream fs = new FileStream(filePath, FileMode.Create))
            {
                fs.Write(pdfBytes, 0, pdfBytes.Length);
            }
        }
        public static string ConvertFileToBase64(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
            {
                throw new ArgumentException("File path cannot be null or empty", nameof(filePath));
            }

            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException("File not found", filePath);
            }

            byte[] fileBytes = File.ReadAllBytes(filePath);
            return Convert.ToBase64String(fileBytes);
        }
    }
}
