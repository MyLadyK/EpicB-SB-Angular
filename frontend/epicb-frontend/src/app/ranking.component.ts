import { Component, OnInit, OnDestroy } from '@angular/core';
import { RankingService } from './services/ranking.service';

export interface RankingEntry {
  userName: string;
  points: number;
}

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit, OnDestroy {
  ranking: RankingEntry[] = [];
  loading = false;
  error: string | null = null;
  currentUser: string | null = null;
  updated = false;

  constructor(private rankingService: RankingService) {}

  ngOnInit() {
    this.currentUser = localStorage.getItem('userName') || null;
    this.fetchRanking();
    window.addEventListener('ranking-updated', this.handleRankingUpdate.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('ranking-updated', this.handleRankingUpdate.bind(this));
  }

  fetchRanking() {
    this.loading = true;
    this.error = null;
    this.rankingService.getRanking().subscribe(
      (data: RankingEntry[]) => {
        this.ranking = data;
        this.loading = false;
        this.updated = true;
        setTimeout(() => this.updated = false, 2000);
      },
      (err: any) => {
        this.error = 'Error al cargar el ranking';
        this.loading = false;
      }
    );
  }

  handleRankingUpdate() {
    this.fetchRanking();
  }
}
