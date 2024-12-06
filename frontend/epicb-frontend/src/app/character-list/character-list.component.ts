import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../services/character.service';
import { Character } from '../model/character';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.css']
})
export class CharacterListComponent implements OnInit {
  characters: Character[] = [];

  constructor(private characterService: CharacterService) { }

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters() {
    this.characterService.getCharacters().subscribe(
      characters => this.characters = characters,
      error => console.error('Error al cargar personajes', error)
    );
  }
}
