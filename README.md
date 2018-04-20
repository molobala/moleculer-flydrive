![Moleculer logo](http://moleculer.services/images/banner.png)

# moleculer-flydrive

Fluent storage manager service with [Node Flydrive](https://github.com/Slynova-Org/node-flydrive).

## Features
- Local
- Amazon S3 (You need to install aws-sdk package to be able to use this driver)
- Digital Ocean Spaces (You need to install aws-sdk package to be able to use this driver)
- FTP (You need to install jsftp package to be able to use this driver)
- Possibility to register a custome driver like [Google Drive driver](https://github.com/molobala/flydrive-google-drive)

## Usage
** With no settings (it will mount local storage driver by default with the current directory as root dir)
```js
	"use strict"
	const FlyDrive = require("moleculer-flydrive");
	const { ServiceBroker } = require("moleculer");
	const broker = new ServiceBroker();
	broker.createService(FlyDrive(),{
		actions: {
			async someAction(ctx){
				//let result = await this.storage.disk().exists("some-file.txt");
				//let result = await this.storage.disk("local").exists("some-file.txt");
				let result = await this.storage.exists("some-file.txt");//will use the default storage defined
				if(result){
					await this.storage.delete("some-file.txt");
				}
			}
		}
	})

```
** With settings
```js
	"use strict"
	const FlyDrive = require("moleculer-flydrive");
	const { ServiceBroker } = require("moleculer");
	const broker = new ServiceBroker();
	//when true passed as param the service will try to create the root dir
	broker.createService(FlyDrive(true),{
		settings:{
			storageConfig:{
				STORAGE_ROOT:"<a path>",
				default: "local",
				disks:{
					local:{
						driver: "local"
					},
					s3: {
			      driver: 's3',
			      key: 'AWS_S3_KEY',
			      secret: 'AWS_S3_SECRET',
			      region: 'AWS_S3_REGION',
			      bucket: 'AWS_S3_BUCKET',
			    },
			    ftp: {
			      driver: 'ftp',
			      host: 'FTP_HOST',
			      port: 21,
			      user: 'FTP_USER',
			      pass: 'FTP_PASS',
			      longLive: false,
			    },
				}
			}
		},
		actions: {
			async someAction(ctx){
				//let result = await this.storage.disk().exists("some-file.txt");
				//let result = await this.storage.disk("s3").exists("some-file.txt");
				let result = await this.storage.exists("some-file.txt");//will use the default storage defined
				if(result){
					await this.storage.delete("some-file.txt");
				}
			}
		}
	})
```
** Register a custom drive

```js
	"use strict"
	const FlyDrive = require("moleculer-flydrive");
	const GoogleDrive = require("flydrive-google-drive");
	const { ServiceBroker } = require("moleculer");
	const broker = new ServiceBroker();
	//when true passed as param the service will try to create the root dir
	broker.createService(FlyDrive(true),{
		settings:{
			storageConfig:{
				STORAGE_ROOT:"<a path>",
				default: "local",
				disks:{
					local:{
						driver: "local"
					},
					s3: {
			      driver: 's3',
			      key: 'AWS_S3_KEY',
			      secret: 'AWS_S3_SECRET',
			      region: 'AWS_S3_REGION',
			      bucket: 'AWS_S3_BUCKET',
			    },
			    ftp: {
			      driver: 'ftp',
			      host: 'FTP_HOST',
			      port: 21,
			      user: 'FTP_USER',
			      pass: 'FTP_PASS',
			      longLive: false,
			    },
			    //register the driver configuration
			    "drive": {
			    	driver: "drive",
			    	clientId: "GOOGLE_DRIVE_CLIENT_ID",
		        clientSecret: "GOOGLE_DRIVE_CLIENT_SECRET",
		        redirectUrl: "GOOGLE_DRIVE_REDIRECT_URL",
		        access_token: "GOOGLE_DRIVE_ACCESS_TOKEN",
		        refresh_token: "GOOGLE_DRIVE_REFRESH_TOKEN"
			    }
				},
				//register the driver hanlder
				customDrivers: {
					drive: GoogleDrive
				}
			}
		}
	})
```
