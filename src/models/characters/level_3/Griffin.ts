import Teams from '../../../enums/Teams.enum'
import logo from './../../../assets/characters/griffin.png'
import Character from '../Character'
import Names from '../../../enums/Name.enum'

export default class Griffin extends Character {

  constructor(team: Teams, count: number) {
    super(team, count)
    this.logo = logo
    this.name = Names.Griffin

    this.assault = 9
    this.defence = 9
    this.minDamage = 3
    this.maxDamage = 6
    this.initiative = 9 
    this.health = 25
    this.maxHealth = 25
    this.speed = 8
    this.shooting = false
    this.isPerformingCounterAttack = false
    this.isCounterAttackPossible = true

    
  }
 
}

