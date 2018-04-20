"use strict"

const FlyDrive = require("../");
const { ServiceBroker } = require("moleculer");
const broker = new ServiceBroker();
broker.createService(FlyDrive(),{
  actions: {
    exists:{
      async handler(ctx){
        //let result = await this.storage.disk().exists(ctx.params.filename);
        //let result = await this.storage.disk("local").exists(ctx.params.filename);
        return await this.storage.exists(ctx.params.filename);//will use the default storage defined
      }
    },
    delete: {
      async handler(ctx){
        return await this.storage.delete(ctx.params.filename);
      }
    },
    getContent: {
      async handler(ctx){
        return await this.storage.get(ctx.params.filename,ctx.params.encoding)
      }
    },
    create: {
      async handler(ctx){
        return await this.storage.put(ctx.params.filename,ctx.params.fileContent);
      }
    }
  }
});

// Start server
broker.start().then(async () => {

  // Call action
  let exist = await broker.call("flydrive.exists", {
    filename:"some-file.txt",
    fileContent: "A content"
  });
  console.log(exist);
  if(!exist){
    console.log(await broker.call("flydrive.create", {
      filename:"some-file.txt",
      fileContent: "Content"
    }))
  }
  console.log(await broker.call("flydrive.getContent", {
    filename: "some-file.txt",
    encoding: "utf-8"
  }));
  console.log(await broker.call("flydrive.delete", {
    filename: "some-file.txt"
  }));
});
