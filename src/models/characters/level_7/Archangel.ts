import Teams from "@enums/Teams.enum";
import logo from "@assets/characters/archangel.png";
import Character from "@models/characters/Character";
import Names from "@enums/Name.enum";

export default class Archangel extends Character {
  constructor(team: Teams, count: number) {
    super(team, count);
    this.logo = logo;
    this.name = Names.Archangel;
    this.level = 7;
    this.strength = 8776;
    this.assault = 20;
    this.defence = 30;
    this.minDamage = 50;
    this.maxDamage = 50;
    this.initiative = 18;
    this.health = 250;
    this.maxHealth = 250;
    this.speed = 10;
    this.shooting = false;
    this.isPerformingCounterAttack = false;
    this.isCounterAttackPossible = true;
  }
}
