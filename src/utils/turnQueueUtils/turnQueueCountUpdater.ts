import Teams from "../../enums/Teams.enum";
import Board from "../../models/Board";
import Character from "../../models/characters/Character";

export default function updateTurnQueueCount(queue: Character[], board: Board): Character[] {
    const allPieces = board.getAllPositions();
    const updatedQueue = queue.filter((queueCharacter) => {
      const boardCharacter = allPieces.find(
        (boardPiece) =>
          queueCharacter.team === boardPiece.character?.team &&
          queueCharacter.name === boardPiece.character?.name
      );

      if (boardCharacter) {
        if (queueCharacter.count !== boardCharacter.character?.count) {
          queueCharacter.count = boardCharacter.character?.count || 0;
        }
        return true;
      }

      return false;
    });
    return updatedQueue
  }