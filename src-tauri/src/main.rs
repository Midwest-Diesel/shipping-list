#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::{File, create_dir, remove_dir_all, remove_file};
use std::{process::Command, env};
use std::{io::copy};
use std::io::{self, Write};
use reqwest::Client;
use serde::{Deserialize};

#[derive(Debug, Deserialize)]
struct LatestVersionInfo {
  version: String,
}


fn main() {
  dotenv::from_filename(".env.development").ok();

  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![
      install_update
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
