/**
 * a copy version of nestjs agenda https://github.com/hanFengSan/nestjs-agenda
 * but have some modifications to fit with our project
 *
 * usage
 * import { AgendaModule } from 'kernel/infas/agenda';

    @Module({
      // AgendaModule.register({ db: { address: 'mongodb://xxxxx' }}) // or custom agenda
      imports: [AgendaModule.register()], // Same as configuring an agenda
      providers: [...],
    })
    export class FooModule {}

    import { Injectable } from '@nestjs/common';
    import { AgendaService } from 'nestjs-agenda';

    @Injectable()
    export class FooService {
      constructor(private readonly agenda: AgendaService) {
        // define a job, more details: [Agenda documentation](https://github.com/agenda/agenda)
        this.agenda.define('TEST_JOB', { lockLifetime: 10000 }, this.testJob.bind(this));
        // schedule a job
        this.agenda.schedule('10 seconds from now', 'TEST_JOB', {});
      }

      private async testJob(job: any, done: any): Promise<void> {
        console.log('a job');
        await job.remove();
        done();
      }
    }
 */

export * from './agenda.module';
