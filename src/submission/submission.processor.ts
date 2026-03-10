import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SubmissionService } from './submission.service';

type SubmissionEvaluationJob = {
  submissionId: string;
};

@Processor('submission-evaluation')
export class SubmissionProcessor extends WorkerHost {
  constructor(private readonly submissionService: SubmissionService) {
    super();
  }

  async process(job: Job<SubmissionEvaluationJob>): Promise<void> {
    await this.submissionService.processSubmission(job.data.submissionId);
  }
}
