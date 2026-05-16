import { CommandFactory } from 'nest-commander';
import { ScrapingCliModule } from './modules/scraping/scraping-cli.module';

async function runCli(): Promise<void> {
  await CommandFactory.run(ScrapingCliModule, {
    logger: ['error', 'warn', 'log'],
    errorHandler: (err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    },
  });
}

void runCli();
