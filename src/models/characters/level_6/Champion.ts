import Teams from "@enums/Teams.enum";
import logo from "@assets/characters/champion.png";
import Character from "@models/characters/Character";
import Names from "@enums/Name.enum";

export default class Champion extends Character {
  constructor(team: Teams, count: number) {
    super(team, count);
    this.logo = logo;
    this.name = Names.Champion;
    this.level = 6;
    this.strength = 2100;
    this.assault = 16;
    this.defence = 16;
    this.minDamage = 20;
    this.maxDamage = 25;
    this.initiative = 10;
    this.health = 100;
    this.maxHealth = 100;
    this.speed = 7;
    this.shooting = false;
    this.isPerformingCounterAttack = false;
    this.isCounterAttackPossible = true;
  }
}
