import React from "react";
import Board from "@models/Board";
import Teams from "@enums/Teams.enum";
import Cell from "@models/Cell";
import Character from "@models/characters/Character";
import Action from "@interfaces/Action";
import updateTurnQueueCount from "./turnQueueUtils/turnQueueCountUpdater";
import updateTurnQueue from "./turnQueueUtils/turnQueueUpdater";

// Алгоритм минимакс для оценки и выбора лучшего хода
function minimax(board: Board, depth: number, isMaximizingPlayer: boolean, alpha: number, beta: number, queue: Character[]) {
  // Базовые случаи: если глубина равна 0 или есть победитель, возвращаем оценку
  if (depth === 0 || board.isWinner()) {
    return { bestScore: evalBoardPosition(board) };
  }

  if (isMaximizingPlayer) {
    let bestMove;
    let bestScore = -Infinity;
    const queueCharacter = queue[0];
    const queueCharacterCell = board
      .getAllPositions()
      .find((position) => queueCharacter.team === position.character?.team && queueCharacter.name === position.character?.name);

    // Проверяем, действительны ли персонаж очереди и его ячейка
    if (queueCharacter && queueCharacterCell) {
      const possibleMoves: Action[] = queueCharacterCell.character!.possibleMoves(board, queueCharacterCell);

      // Проверяем, все ли возможные ходы - это действия "move"
      const isMovesOnly = possibleMoves.every((move) => move.actionName == "move");
      if (isMovesOnly) {
        // Если возможны только действия "move", корректируем ходы в зависимости от ближайшего врага
        const closestEnemy = findClosestEnemy(queueCharacterCell, board);
        leftCellToClosestEnemy(possibleMoves, closestEnemy);
      }

      // Итерируемся по возможным ходам и оцениваем лучший
      for (const move of possibleMoves) {
        const boardCopy = new Board(12, 10);
        boardCopy.copyBoard(board);
        const copyCharacter = boardCopy.cells[queueCharacterCell.row][queueCharacterCell.col].character!;
        // Применяем ход к копии доски
        if (move.actionName === "shoot") {
          copyCharacter.shoot(move.to, move.from, boardCopy);
        }
        if (move.actionName === "attack") {
          copyCharacter.attack(move.to, move.from, queueCharacterCell, boardCopy);
        }
        if (move.actionName === "move") {
          // Пропускаем ход, если это не действительный ход "move"
          if (!isMovesOnly) {
            continue;
          }
          copyCharacter.move(move.to, move.from, boardCopy);
        }
        const updatedQueueCount = updateTurnQueueCount(queue, boardCopy);
        const updatedQueue = updateTurnQueue(updatedQueueCount);

        const isMaximizingPlayerNext = updatedQueue[0].team === Teams.Player;
        // Рекурсивный вызов минимакса для следующего уровня
        let result = minimax(boardCopy, depth - 1, isMaximizingPlayerNext, alpha, beta, updatedQueue);
        let score = result.bestScore;
        // Обновляем лучший ход и оценку, если найден лучший ход
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
        // Обновляем альфа для отсечения
        alpha = Math.max(alpha, score);
        if (beta <= alpha) {
          // Отсечение бета: выход из цикла, если выполняется условие отсечения
          break;
        }
      }
    }

    return { bestScore, bestMove };
  } else {
    // Ход уменьшающегося игрока
    let bestScore = Infinity;
    let bestMove;
    const queueCharacter = queue[0];
    const queueCharacterCell = board
      .getAllPositions()
      .find((position) => queueCharacter.team === position.character?.team && queueCharacter.name === position.character?.name);
    if (queueCharacterCell) {
      const possibleMoves: Action[] = queueCharacterCell.character!.possibleMoves(board, queueCharacterCell);

      const isMovesOnly = possibleMoves.every((move) => move.actionName == "move");
      if (isMovesOnly) {
        const closestEnemy = findClosestEnemy(queueCharacterCell, board);
        leftCellToClosestEnemy(possibleMoves, closestEnemy);
      }

      for (const move of possibleMoves) {
        const boardCopy = new Board(12, 10);
        boardCopy.copyBoard(board);
        const copyCharacter = boardCopy.cells[queueCharacterCell.row][queueCharacterCell.col].character!;
        if (move.actionName === "shoot") {
          copyCharacter.shoot(move.to, move.from, boardCopy);
        }
        if (move.actionName === "attack") {
          copyCharacter.attack(move.to, move.from, queueCharacterCell, boardCopy);
        }
        if (move.actionName === "move") {
          if (!isMovesOnly) {
            continue;
          }
          copyCharacter.move(move.to, move.from, boardCopy);
        }
        const updatedQueueCount = updateTurnQueueCount(queue, boardCopy);
        const updatedQueue = updateTurnQueue(updatedQueueCount);
        const isMaximizingPlayerNext = updatedQueue[0].team === Teams.Player;

        let result = minimax(boardCopy, depth - 1, isMaximizingPlayerNext, alpha, beta, updatedQueue);

        let score = result.bestScore;

        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }

        // Обновляем бета для отсечения
        beta = Math.min(beta, score);
        if (beta <= alpha) {
          // Отсечение бета: выход из цикла, если выполняется условие отсечения
          break;
        }
      }
    }

    return { bestScore, bestMove };
  }
}

// Оцениваем позицию доски на основе силы и количества персонажей
function evalBoardPosition(board: Board) {
  let playerTotalStrength: number = 0;
  let enemyTotalStrength: number = 0;
  for (let row = 0; row < board.sizeY; row++) {
    for (let col = 0; col < board.sizeX; col++) {
      const character = board.cells[row][col].character;
      if (character && character.team === Teams.Computer) {
        enemyTotalStrength += character.strength * character.count;
      }
      if (character && character.team === Teams.Player) {
        playerTotalStrength += character.strength * character.count;
      }
    }
  }

  // Оценка основана на разнице между силой игрока и врага
  return playerTotalStrength - enemyTotalStrength;
}

// Изменяем порядок возможных ходов в зависимости от близости к ближайшему врагу
function leftCellToClosestEnemy(possibleMoves: Action[], closestEnemy: Cell) {
  possibleMoves.sort((a, b) => {
    const distanceX_A = Math.abs(a.to.col - closestEnemy.col);
    const distanceY_A = Math.abs(a.to.row - closestEnemy.row);
    const distanceX_B = Math.abs(b.to.col - closestEnemy.col);
    const distanceY_B = Math.abs(b.to.row - closestEnemy.row);

    // Сортировка ходов в зависимости от общего расстояния до ближайшего врага
    return distanceX_A + distanceY_A - (distanceX_B + distanceY_B);
  });
  // Оставляем только первый ход, отбрасывая остальные
  possibleMoves.splice(1, possibleMoves.length);
}

// Находим ближайшего врага к заданной ячейке
function findClosestEnemy(moveFrom: Cell, board: Board): Cell {
  const enemyPositions = moveFrom.character!.team === Teams.Computer ? board.getPlayerPositions() : board.getComputerPositions();
  let distanceDif = Infinity;
  let closestEnemy = moveFrom;
  enemyPositions.forEach((pos) => {
    const distanceX = Math.abs(pos.col - moveFrom.col);
    const distanceY = Math.abs(pos.row - moveFrom.row);
    if (distanceX + distanceY <= distanceDif) {
      distanceDif = distanceX + distanceY;
      closestEnemy = pos;
    }
  });
  return closestEnemy;
}

export default minimax;
