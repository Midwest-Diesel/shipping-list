#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::{File, create_dir, remove_dir_all, remove_file};
use std::{process::Command, env};
use std::{io::copy};
use std::io::{self, Write};
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
struct LatestVersionInfo {
  version: String,
}

#[derive(Deserialize, Serialize)]
struct BackupShippingListArgs {
  path: String,
  name: String
}


fn main() {
  dotenv::from_filename(".env.development").ok();

  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![
      install_update,
      backup_shipping_list
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn install_update() {
  println!("Update detected");
  io::stdout().flush().unwrap();

  if let Err(e) = download_update().await {
    println!("Error downloading the update: {}", e);
    io::stdout().flush().unwrap();
    return;
  }

  println!("Update successful, restarting app...");
  io::stdout().flush().unwrap();

  let product_name = "Shipping-List";
  let install_dir = r"C:\MWD\repos\content\shipping-list";

  let batch_script = format!(r#"
    @echo off
    echo Installing update...
    taskkill /F /IM "{product_name}.exe" > NUL 2>&1
    start "" "{install_dir}\{product_name}.exe"
    del "%~f0" & exit
  "#);

  let script_path = r"C:\MWD\repos\content\shipping-list\updates\restart_app.bat";
  std::fs::write(script_path, batch_script).unwrap();

  let _ = Command::new("cmd.exe")
    .args(["/C", script_path])
    .spawn();

  std::process::exit(0);
}

async fn download_update() -> Result<(), Box<dyn std::error::Error>> {
  let _ = remove_dir_all("C:/MWD/repos/content/shipping-list/updates");
  let _ = create_dir("C:/MWD/repos/content/shipping-list/updates");

  let (product_name, update_json_url, install_dir) = (
    "Shipping-List",
    "https://raw.githubusercontent.com/Midwest-Diesel/shipping-list/refs/heads/main/latest.json",
    r"C:/MWD/repos/content/shipping-list"
  );

  let _ = remove_file("C:/mwd/scripts/launch_test.vbs");
  let client = Client::new();
  let res = client
    .get(update_json_url)
    .send()
    .await?
    .json::<LatestVersionInfo>()
    .await?;

  let version_tag = res.version.trim_start_matches('v');
  let version_file = version_tag.replace("-shipping-list", "");
  let url = format!(
    "https://github.com/Midwest-Diesel/shipping-list/releases/download/v{}/{}_{}_x64-setup.exe",
    version_tag, product_name, version_file
  );
  let exe_path = format!(
    "C:/MWD/repos/content/shipping-list/updates/{}_{}_x64-setup.exe",
    product_name,
    version_file
  );
  
  let response = client
    .get(&url)
    .send().await?
    .error_for_status()?;

  let mut dest = File::create(&exe_path)?;
  copy(&mut response.bytes().await?.as_ref(), &mut dest)?;
  drop(dest);

  println!("Installer downloaded successfully.");

  Command::new(&exe_path)
    .args(["/S", &format!("/D={}", install_dir)])
    .spawn()?;

  println!("Installer executed.");
  Ok(())
}

#[tauri::command]
fn backup_shipping_list(args: BackupShippingListArgs) -> Result<(), String> {
  let downloads = dirs::download_dir().ok_or("Could not find Downloads directory")?;
  let source = downloads.join(&args.name);
  let destination = std::path::Path::new(&args.path).join(&args.name);

  let file = std::fs::read(&source).map_err(|e| {
    format!("Could not read source {:?}: {}", source, e)
  })?;

  std::fs::write(&destination, file).map_err(|e| {
    format!("Could not write destination {:?}: {}", destination, e)
  })?;

  std::fs::remove_file(&source).map_err(|e| e.to_string())?;

  let vbs_script = format!(
    r#"
    Dim ExcelApp, Workbook, sheet, r, rowNum

    On Error Resume Next

    Set ExcelApp = CreateObject("Excel.Application")
    ExcelApp.Visible = False
    ExcelApp.DisplayAlerts = False

    Set Workbook = ExcelApp.Workbooks.Open({})

    If Err.Number <> 0 Then
      ExcelApp.Quit
      WScript.Quit 1
    End If

    On Error GoTo 0

    For Each sheet In Workbook.Worksheets
      sheet.Rows(1).Font.Bold = True
      sheet.Rows(1).Font.Size = 18
      sheet.Rows(1).Interior.Color = RGB(255, 255, 255)

      sheet.Rows(2).Font.Bold = True
      sheet.Rows(2).HorizontalAlignment = -4108
      sheet.Rows(2).Interior.Color = RGB(255, 255, 255)

      sheet.Cells(2, 4).Font.Color = RGB(255, 0, 0)
      sheet.Cells(2, 9).Font.Color = RGB(255, 0, 0)
      sheet.Cells(2, 10).Font.Color = RGB(255, 0, 0)
      sheet.Cells(2, 11).Font.Color = RGB(255, 0, 0)
      sheet.Cells(2, 12).Font.Color = RGB(255, 0, 0)
      sheet.Cells(2, 13).Font.Color = RGB(255, 0, 0)

      sheet.Range("I:Q").HorizontalAlignment = -4108

      For rowNum = 3 To sheet.UsedRange.Row + sheet.UsedRange.Rows.Count - 1
        If UCase(Trim(CStr(sheet.Cells(rowNum, 23).Value))) = "TRUE" Then
          sheet.Rows(rowNum).Interior.Color = RGB(255, 255, 0)
        ElseIf UCase(Trim(CStr(sheet.Cells(rowNum, 21).Value))) = "TRUE" Then
          sheet.Rows(rowNum).Font.Color = RGB(192, 0, 0)
          sheet.Rows(rowNum).Interior.Color = RGB(255, 213, 171)
        ElseIf UCase(Trim(CStr(sheet.Cells(rowNum, 22).Value))) = "TRUE" Then
          sheet.Rows(rowNum).Font.Color = RGB(0, 100, 0)
          sheet.Rows(rowNum).Interior.Color = RGB(200, 255, 200)
        End If

        If UCase(Trim(CStr(sheet.Cells(rowNum, 24).Value))) = "TRUE" Then
          sheet.Rows(rowNum).Font.Bold = True
        End If
      Next

      For Each r In sheet.UsedRange
        If UCase(Trim(CStr(r.Value))) = "TRUE" Then
          r.Value = "x"
        ElseIf UCase(Trim(CStr(r.Value))) = "FALSE" Then
          r.Value = ""
        End If

        If r.Column = 1 Then
          If CStr(r.Value) = "Fedex Small Pak" Or _
            CStr(r.Value) = "Misc" Or _
            CStr(r.Value) = "Will Call" Or _
            CStr(r.Value) = "Truck Lines" Then

            r.Font.Bold = True
            r.Font.Underline = 2
          End If
        End If
      Next

      sheet.Columns("U:X").Delete
      sheet.UsedRange.EntireColumn.AutoFit
    Next

    Workbook.Save
    Workbook.Close
    ExcelApp.Quit

    Set sheet = Nothing
    Set Workbook = Nothing
    Set ExcelApp = Nothing
    "#,
    format!("{:?}", destination)
  );

  let temp_vbs_path = "C:/mwd/scripts/backup_shipping_list.vbs";
  std::fs::write(&temp_vbs_path, vbs_script).unwrap();
  std::process::Command::new("wscript.exe")
    .arg(temp_vbs_path)
    .output()
    .unwrap();

  Ok(())
}
