import React, { FC, memo } from 'react';
import Cell from '@models/Cell';
import ArmyCountBar from './ArmyCountBar';
import Teams from '@enums/Teams.enum';
import { useGrid } from '../../../contexts/GridProvider';

interface Props {
  cell: Cell;
  isLastHoveredCell: boolean | null;
  onClick: (cell: Cell) => void;
  canMove: boolean | undefined;
  canEnemyMove: boolean | undefined;
  isSelected: boolean;
  canBeAttacked: boolean | null | undefined;
  onMouseEnter: (cell: Cell) => void;
}

const CellComponent: FC<Props> = memo(({
  cell,
  isLastHoveredCell,
  onClick,
  canMove,
  canEnemyMove,
  onMouseEnter,
  isSelected,
  canBeAttacked
}) => {
  const { gridOn } = useGrid();
  console.log(123)
  const cellClasses = `
    ${cell.row}${cell.col} w-[81px] h-[81px] relative flex items-start justify-start 
    ${cell.character ? 'hover:opacity-80' : ''}
    ${isLastHoveredCell ? 'rounded-lg' : ''}
    ${(canMove && !canEnemyMove)  ? 'opacity-90 hover:opacity-80' : ''}
    ${isSelected ? 'opacity-70' : ''}
    ${canBeAttacked ? 'opacity-90' : ''}
    ${canEnemyMove ? 'opacity-80' : ''}
    ${gridOn ? 'border-[1px] border-gray-500' : ''}`;
  // анимация opacity клетка к клетки, алгоритм дейкстры.

  const isImageReversed = cell.character?.team === Teams.Computer ? 'scale-x-[-1]' : ''
  const isPulsing = (cell.character && isSelected) ? 'animate-pulse' : ''
  return (
    <div
      onClick={() => onClick(cell)}
      onMouseEnter={() => onMouseEnter(cell)}
      className={cellClasses}
      style={{ background: `url(${cell.bg}) no-repeat center / contain ` }}
    >
      {cell.character?.logo && (
        <img
          src={cell.character.logo}
          alt='character'
          className={`absolute bottom-0 left-0 ${isImageReversed} ${isPulsing}`}
        />
        
      )}

      {cell.character && (
        <div className='absolute bottom-0 right-0'>
          <ArmyCountBar armyCount={cell.character.count} team={cell.character.team} />
        </div>
      )}
    
      {cell.obstacle?.logo && (
        <div className='flex items-center justify-center w-full h-full'>
          <img
            src={cell.obstacle.logo}
            alt='obstacle'
            className='w-[50px] h-[50px]'
          />
        </div>
      )}
    </div>
  );
});

export default CellComponent;