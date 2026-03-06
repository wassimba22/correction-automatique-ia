import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  async getStatistiques() {
    return {
      totalTextes: 0,
      totalCorrections: 0,
      moyenneNotes: 0,
    };
  }
}
