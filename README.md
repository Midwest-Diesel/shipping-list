# Shipping List

## Installation
- Download the latest zip file from https://github.com/Midwest-Diesel/shipping-list/releases
- Create a folder called *C:\MWD\repos\content\shipping-list* and drag the installer into there
- Launch the installer
- Set the install location *C:\MWD\repos\content\shipping-list* when prompted during the installation process

# Development

## Getting Started
- `git clone git@github.com:Midwest-Diesel/shipping-list.git`
- `npm install`
- Create file named *publish.sh*
- Run the following commands:
  - `chmod +x publish.sh`
  - `npm run tauri dev`

## Publish Changes
- Publish to production:
  - Change version inside of *src-tauri/tauri.conf.json*
  - `npm run publish`
  - Commit and push
