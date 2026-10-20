$csharpCode = @'
using System;
using System.IO;
using System.Threading.Tasks;
using Windows.Storage;
using Windows.Media.Transcoding;
using Windows.Media.MediaProperties;

public class AudioTranscoder
{
    public static bool ExtractAudio(string sourceVideoPath, string destinationAudioPath)
    {
        try
        {
            var srcTask = StorageFile.GetFileFromPathAsync(sourceVideoPath).AsTask();
            srcTask.Wait();
            StorageFile srcFile = srcTask.Result;

            string destDir = Path.GetDirectoryName(destinationAudioPath);
            string destFileName = Path.GetFileName(destinationAudioPath);

            var folderTask = StorageFolder.GetFolderFromPathAsync(destDir).AsTask();
            folderTask.Wait();
            StorageFolder destFolder = folderTask.Result;

            var createFileTask = destFolder.CreateFileAsync(destFileName, CreationCollisionOption.ReplaceExisting).AsTask();
            createFileTask.Wait();
            StorageFile destFile = createFileTask.Result;

            MediaTranscoder transcoder = new MediaTranscoder();
            MediaEncodingProfile profile;

            string ext = Path.GetExtension(destinationAudioPath).ToLower();
            if (ext == ".mp3")
            {
                profile = MediaEncodingProfile.CreateMp3(AudioEncodingQuality.High);
            }
            else if (ext == ".wav")
            {
                profile = MediaEncodingProfile.CreateWav(AudioEncodingQuality.High);
            }
            else
            {
                profile = MediaEncodingProfile.CreateM4a(AudioEncodingQuality.High);
            }

            var prepTask = transcoder.PrepareFileTranscodeAsync(srcFile, destFile, profile).AsTask();
            prepTask.Wait();
            PrepareTranscodeResult prep = prepTask.Result;

            if (!prep.CanTranscode)
            {
                Console.WriteLine("Cannot transcode: " + prep.FailureReason);
                return false;
            }

            var transTask = prep.TranscodeAsync().AsTask();
            transTask.Wait();
            Console.WriteLine("Transcode complete: " + destinationAudioPath);
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine("Exception in Transcode: " + ex.ToString());
            return false;
        }
    }
}
'@

$refs = @(
    "C:\Windows\System32\WinMetadata\Windows.Foundation.winmd",
    "C:\Windows\System32\WinMetadata\Windows.Storage.winmd",
    "C:\Windows\System32\WinMetadata\Windows.Media.winmd",
    "System.Runtime.WindowsRuntime"
)

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies $refs

$src = (Resolve-Path "assets/gemini_generated_video_45dea1c5.mp4").Path
$dstM4a = [System.IO.Path]::Combine((Get-Item "assets").FullName, "siska_suara_asli.m4a")
$dstMp3 = [System.IO.Path]::Combine((Get-Item "assets").FullName, "siska_suara_asli.mp3")

Write-Host "Extracting M4A..."
[AudioTranscoder]::ExtractAudio($src, $dstM4a)

Write-Host "Extracting MP3..."
[AudioTranscoder]::ExtractAudio($src, $dstMp3)

Get-ChildItem assets/siska_suara_asli.* | Select-Object Name, Length
