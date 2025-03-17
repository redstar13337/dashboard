import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'dashboard';

  summonerName: string = '';
  tag: string = '';
  apiKey: string = 'RGAPI-69bc90e7-5f6c-482c-9278-37f58d439035';

  puuid: string = '';
  matchIds: string[] = [];
  selectedMatchId: string | null = null;
  matchDetailsMap: Map<string, any> = new Map();

  constructor(private http: HttpClient) {}

  fetchAccount() {
    const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${this.summonerName}/${this.tag}`;

    const headers = new HttpHeaders({
      'X-Riot-Token': this.apiKey
    });

    this.http.get(url, { headers, responseType: 'text' })
      .subscribe(
        response => {
          console.log('API Response:', response);
          try {
            const jsonResponse = JSON.parse(response);  // Parse the response string to JSON
            this.puuid = jsonResponse.puuid;  // Extract the puuid

            console.log(this.puuid);

            this.fetchMatchIds(this.puuid);
          } catch (error) {
            console.error('Failed to parse JSON:', error);
          }
        },
        error => {
          console.error('Error:', error);
        }
      );
  }

  fetchMatchIds(puuid: string) {
    const urlMatches = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`;

    const headers = new HttpHeaders({
      'X-Riot-Token': this.apiKey
    });

    this.http.get(urlMatches, { headers, responseType: 'text' })
    .subscribe(
      response => {
        console.log('API Response:', response);
        try {
          const jsonResponse = JSON.parse(response);
          console.log(jsonResponse);
          this.matchIds = jsonResponse;
        } catch (error) {
          console.error('Failed to parse JSON:', error);
        }
      },
      error => {
        console.error('Error:', error);
      }
    );
  }

  onMatchClick(matchId: string) {
    this.selectedMatchId = matchId;

    if (this.matchDetailsMap.has(matchId)) {
      return;
    }

    // If not cached, fetch from the API
    const url = `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`;
    const headers = new HttpHeaders({ 'X-Riot-Token': this.apiKey });

    this.http.get(url, { headers })
      .subscribe(
        response => {
          console.log('Fetched Match Details:', response);
          this.matchDetailsMap.set(matchId, response);  // Store in cache
        },
        error => {
          console.error('Error fetching match details:', error);
        }
      );
  }

  getMatchDetails() {
    return this.selectedMatchId ? this.matchDetailsMap.get(this.selectedMatchId) : null;
  }

}
