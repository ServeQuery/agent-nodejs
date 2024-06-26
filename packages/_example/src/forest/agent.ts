import { AgentOptions, createAgent } from '@servequery/agent';
import { createMongoDataSource } from '@servequery/datasource-mongo';
import { createMongooseDataSource } from '@servequery/datasource-mongoose';
import { createSequelizeDataSource } from '@servequery/datasource-sequelize';
import { createSqlDataSource } from '@servequery/datasource-sql';

import customizeAccount from './customizations/account';
import customizeCard from './customizations/card';
import customizeComment from './customizations/comment';
import customizeCustomer from './customizations/customer';
import customizeDvd from './customizations/dvd';
import customizeOwner from './customizations/owner';
import customizePost from './customizations/post';
import customizeRental from './customizations/rental';
import customizeReview from './customizations/review';
import customizeSales from './customizations/sale';
import customizeStore from './customizations/store';
import createTypicode from './datasources/typicode';
import { Schema } from './typings';
import mongoose, { connectionString } from '../connections/mongoose';
import sequelizeMsSql from '../connections/sequelize-mssql';
import sequelizeMySql from '../connections/sequelize-mysql';
import sequelizePostgres from '../connections/sequelize-postgres';

export default function makeAgent() {
  const envOptions: AgentOptions = {
    authSecret: process.env.SERVEQUERY_AUTH_SECRET,
    envSecret: process.env.SERVEQUERY_ENV_SECRET,
    servequeryServerUrl: process.env.SERVEQUERY_SERVER_URL,
    isProduction: false,
    loggerLevel: 'Info',
    typingsPath: 'src/servequery/typings.ts',
  };

  return createAgent<Schema>(envOptions)
    .addDataSource(createSqlDataSource({ dialect: 'sqlite', storage: './assets/db.sqlite' }))

    .addDataSource(
      // Using an URI
      createSqlDataSource('mariadb://example:password@localhost:3808/example'),
      { include: ['customer'] },
    )
    .addDataSource(
      // Using a connection object
      createSqlDataSource({
        dialect: 'mariadb',
        username: 'example',
        password: 'password',
        port: 3808,
        database: 'example',
      }),
      { include: ['card'] },
    )
    .addDataSource(createTypicode())
    .addDataSource(createSequelizeDataSource(sequelizePostgres))
    .addDataSource(createSequelizeDataSource(sequelizeMySql))
    .addDataSource(createSequelizeDataSource(sequelizeMsSql))
    .addDataSource(
      createMongooseDataSource(mongoose, { asModels: { account: ['address', 'bills.items'] } }),
    )
    .addDataSource(
      createMongoDataSource({
        uri: connectionString,
        dataSource: { flattenMode: 'auto' },
      }),
      {
        exclude: ['accounts', 'accounts_bills', 'accounts_bills_items'],
      },
    )
    .addChart('numRentals', async (context, resultBuilder) => {
      const rentals = context.dataSource.getCollection('rental');
      const rows = await rentals.aggregate({}, { operation: 'Count' });

      return resultBuilder.value((rows?.[0]?.value as number) ?? 0);
    })

    .customizeCollection('card', customizeCard)
    .customizeCollection('account', customizeAccount)
    .customizeCollection('owner', customizeOwner)
    .customizeCollection('store', customizeStore)
    .customizeCollection('rental', customizeRental)
    .customizeCollection('dvd', customizeDvd)
    .customizeCollection('customer', customizeCustomer)
    .customizeCollection('post', customizePost)
    .customizeCollection('comment', customizeComment)
    .customizeCollection('review', customizeReview)
    .customizeCollection('sales', customizeSales);
}
