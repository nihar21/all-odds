import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';

import { SportsSelectionModule } from './modules/sports-selection/sports-selection.module';
import { SportDetailModule } from './modules/sport-details/sport-detail.module';
import { LeagueDetailsModule } from './modules/league-details/league-details.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SportsSelectionModule,
    SportDetailModule,
    LeagueDetailsModule,
    BrowserAnimationsModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

const firebaseConfig = {
  apiKey: "AIzaSyBXC1_YjBXCtYHdiY_nQjTnyJs-sFhuQQY",
  authDomain: "all-odds-f088a.firebaseapp.com",
  projectId: "all-odds-f088a",
  storageBucket: "all-odds-f088a.appspot.com",
  messagingSenderId: "1043649113634",
  appId: "1:1043649113634:web:067f3a847c6c1cbe7ce47b",
  measurementId: "G-5TZZNE530M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);