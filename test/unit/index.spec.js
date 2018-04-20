const { ServiceBroker } = require("moleculer");
const mkdir = require("mkdirp").sync;
const path = require("path");
const fs = require("fs-extra");
const StorageManager = require('@slynova/flydrive');
const LocalFileSystem = require("@slynova/flydrive/src/Drivers/LocalFileSystem");
const StorageService = require('../../');
describe("Test 'moleculer flydrive' service", () => {
	describe("Creation test with default settings", () => {
		const broker = new ServiceBroker();
		const service = broker.createService(StorageService());
		beforeAll(() => broker.start());
		afterAll(() => broker.stop());
		it("Sould define missing settings it self",()=>{
			expect(service.settings.STORAGE_ROOT).toBe("");
			//local storage shoulbe create
			expect(service.settings.storageConfig.disks).toBeDefined()
			expect(service.settings.storageConfig.disks.local).toBeDefined()
			expect(service.settings.storageConfig.disks.local.driver).toBe("local");
			expect(service.settings.defaultStorage).toBe("local");
			expect(service.disk().driver).toBeInstanceOf(LocalFileSystem);
			expect(service.disk("local").driver).toBeInstanceOf(LocalFileSystem);
		});
		it("Sould create a StorageManager instance",()=>{
			expect(service).toBeDefined();
			expect(service.storage).toBeDefined();
			expect(service.storage).toBeInstanceOf(StorageManager);
		});
			
		it("should manipulate file on localstorage with default ", async ()=>{
			expect(service).toBeDefined();
			expect(service.storage).toBeDefined();
			expect(service.storage).toBeInstanceOf(StorageManager);
			expect(service.settings.STORAGE_ROOT).toBe("");
			await service.storage.put("some-file.txt", "molo test");
			expect(await service.storage.exists("some-file.txt")).toBe(true);
			expect(await fs.pathExists("some-file.txt")).toBe(true);
			const fileContent = await service.storage.get("some-file.txt","utf-8");
			expect(fileContent).toBe("molo test");
			await service.storage.delete("some-file.txt");
			expect(await service.storage.exists("some-file.txt")).toBe(false);
		})


	});
	describe("with settings", ()=>{
		const broker = new ServiceBroker();
		beforeAll(() => broker.start());
		afterAll(() => broker.stop());
		it("should create the root dir when passing tryToCreateRoot param", async ()=>{
			expect(await fs.pathExists("")).toBe(false);
			const service = broker.createService(StorageService(true), {
				settings: {
					STORAGE_ROOT: "./upload",
					defaultStrage: "local"
				}
			});
			expect(service).toBeDefined();
			expect(service.storage).toBeDefined();
			expect(service.storage).toBeInstanceOf(StorageManager);
			expect(await fs.pathExists(service.settings.STORAGE_ROOT)).toBe(true);
			await fs.remove(service.settings.STORAGE_ROOT);
		})
		it("should manipulate file on localstorage with custom settings ", async ()=>{
			const service = broker.createService(StorageService(true), {
				settings: {
					STORAGE_ROOT: "./upload",
					defaultStrage: "local"
				}
			});
			expect(service).toBeDefined();
			expect(service.storage).toBeDefined();
			expect(service.storage).toBeInstanceOf(StorageManager);
			await service.storage.put("some-file.txt", "molo test");
			expect(await service.storage.exists("some-file.txt")).toBe(true);
			expect(await fs.pathExists("upload/some-file.txt")).toBe(true);
			const fileContent = await service.storage.get("some-file.txt","utf-8");
			expect(fileContent).toBe("molo test");
			await service.storage.delete("some-file.txt");
			expect(await service.storage.exists("some-file.txt")).toBe(false);
			await fs.remove(service.settings.STORAGE_ROOT);
			expect(await fs.pathExists(service.settings.STORAGE_ROOT)).toBe(false);
		})
	})
	
	describe("Custom driver registration", ()=>{
		it("should register a custom driver",()=>{
			const Driver = jest.fn();
			const broker = new ServiceBroker();
			const service = broker.createService(StorageService(),{
				settings: {
					STORAGE_ROOT: "./upload",
					defaultStrage: "local",
					storageConfig: {
						disks:{
							molo:{
								driver:"molo",
								config1:"",
								config2:""
							}
						}
					}
				}
			});
			expect(service).toBeDefined()
			service.extends("molo",Driver);
			expect(service.disk("molo")).toBeDefined();
			expect(service.disk("molo").driver).toBeInstanceOf(Driver);
		})
		it("should call custom driver methods",()=>{
			const DriverLogic ={
				existsFile:jest.fn((name)=>name)
			};
			const Driver = jest.fn((config)=>DriverLogic);
			const broker = new ServiceBroker();
			const service = broker.createService(StorageService(),{
				settings: {
					STORAGE_ROOT: "./upload",
					defaultStorage: "molo",
					storageConfig: {
						disks:{
							molo:{
								driver: "molo",
								config1:"config1",
								config2:"config2"
							}
						},
						customDrivers:{
							"molo": Driver
						}
					}
				}
			});
			expect(service).toBeDefined()
			//service.extends("molo",Driver);
			expect(service.disk("molo")).toBeDefined();
			expect(Driver).toHaveBeenCalledTimes(1);
			expect(service.storage.existsFile("file.txt")).toBe("file.txt");
			expect(service.disk("molo").existsFile("file.txt")).toBe("file.txt");
		})
	});
});
