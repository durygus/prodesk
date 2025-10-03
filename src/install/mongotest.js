/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Chris Brame
 *  Updated:    1/20/19 4:43 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import database from '../database/index.js'

global.env = process.env.NODE_ENV || 'production'
;(function () {
  const CONNECTION_URI = process.env.MONGOTESTURI
  console.log('MongoDB test connection URI:', CONNECTION_URI);
  
  if (!CONNECTION_URI) return process.send({ error: { message: 'Invalid connection uri' } })
  const options = {
    connectTimeoutMS: 5000
  }
  
  console.log('Attempting MongoDB connection with options:', options);
  
  database.init(
    function (e, db) {
      console.log('MongoDB connection result:', { error: e, db: !!db });
      
      if (e) {
        console.log('MongoDB connection error:', e);
        setTimeout(() => {
          process.send({ error: e });
          process.exit(1);
        }, 100);
        return;
      }

      if (!db) {
        console.log('MongoDB connection failed: Unable to open database');
        setTimeout(() => {
          process.send({ error: { message: 'Unable to open database' } });
          process.exit(1);
        }, 100);
        return;
      }

      console.log('MongoDB connection successful!');
      
      // Добавляем небольшую задержку перед отправкой ответа
      setTimeout(() => {
        console.log('Sending success response to parent process');
        process.send({ success: true });
        process.exit(0);
      }, 100);
    },
    CONNECTION_URI,
    options
  )
})()
