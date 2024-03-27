export enum PlayerEnum {
    Me      = 1,
    Other   = 2,
}

type BoardCellValue = (PlayerEnum | null);

export type BoardState = [[BoardCellValue, BoardCellValue, BoardCellValue],
                          [BoardCellValue, BoardCellValue, BoardCellValue],
                          [BoardCellValue, BoardCellValue, BoardCellValue]];