const EmptyBoard = document.querySelector('.tableBoard').innerHTML;

const boardLength = 12;
const board = new Array(boardLength);
let boardRow;
let minesPositions = [];


//hello viatnam!!!!!!! wazaaaaaaaaaaaaaaaaaa what a goal!

///////////////////////////////////////////// init game  ////////////////////////////////////////////////

async function initGame() {

    for (let index = 0; index < board.length; index++) {
        board[index] = new Array(boardLength);
        boardRow = board[index];
        
        if(index == 0 || index == board.length-1){
            for (let col = 0; col < boardLength; col++) {
                boardRow[col] = -1;
                
            }
        }
        else {

            //safe board at edges with value of -1 in each cell in the first/last row/column
            for (let j = 0; j < boardRow.length; j++) {
                if(j==0 || j==boardRow.length -1)
                boardRow[j] = -1;
               
                
            }
        }
    }


    ///////////////////////////////////////// initiate mines //////////////////////////////////////   

    const NumOfMines = 10;
    let x , y;
    for (let index = 0; index < NumOfMines; index++) {
        //define random position for each bomb 
        // bomb represention => -5 
        x = Math.floor(Math.random()*10+1);
        y = Math.floor(Math.random()*10+1);
        
        boardRow = board[x] ;
        //check for duplicate bomb position
        if(boardRow[y]!=-5)
        {
            boardRow[y] = -5;
            minesPositions[index] = { row : x , col : y};
        }
        else    index--;
    }

    document.querySelector('.NumOfMines').innerHTML = NumOfMines;

    //  mines are set //

    ///////////////////////////////////// initiate cells values ////////////////////////////////////
    // each cell gets the value of number of mines *near them 
    // *near is 1 cell away from mine

    // option 1
    let count = 0;
    for (let row = 1; row < board.length - 1; row++) {
        let boardRow = board[row];

        for (let col = 1; col < boardRow.length - 1; col++) {
        
            // if cell isn't a mine
            if(boardRow[col]!= -5)
            {
                count = CheckNumOfMinesAroundCell(row,col);
              
                    // cell value +10 to indeicate it's unexposed to the user
                    boardRow[col] = count+10;
               
            }
        }
    }

   
        
 
    function CheckNumOfMinesAroundCell(CellRow,CellCol) {
        let count = 0;
        let boardRow;
        for (let row = CellRow-1; row < CellRow+2; row++) {
            boardRow = board[row];

            for (let column = CellCol-1; column < CellCol+2; column++) {
                if(boardRow[column] == -5)
                    count++;
            }
        }
        return count;
    }

    console.log(board);
}




////////////////////////////////////// game ////////////////////////////////////////

initGame();
printBoard(board);

let countRightClick = 0 , win = false , lose = false , row , column , RunTimer = false;
let CurrentCell;

function addEventListenersToButtons() {

    document.querySelectorAll('tr td button').forEach(element => {
        
        ['click','contextmenu'].forEach(clickEvent => {

            element.addEventListener(clickEvent,async (e) => {
                
                    if(!lose) //if user did not picked an -5 value cell
                    {
                        console.log(clickEvent);

                        if(!RunTimer)
                        {
                            renderTimer(); //to do
                            RunTimer = true;
                        }

                        console.log(e);
                        

                        //check which cell was clicked by the user
                       if(e.target.parentNode.nodeName !== 'TD')
                       {
                         CurrentCell = e.target.parentNode.parentNode;
                       }
                       else {
                           CurrentCell = e.target.parentNode; 
                       }
                        column = CheckYAxix(CurrentCell);
                        row = CheckXAxix(CurrentCell.parentNode);
                        boardRow = board[row];
                        window.r = boardRow;

                        //if click was to render cell
                        if(clickEvent == 'click' && (boardRow[column] % 1 == 0))
                        {
                            //if user lost
                            if(boardRow[column] == -5) {
                                console.log('boooooooooooooom');
                                lose = true;
                                await renderBomb(e.target.parentElement);
                                
                                setTimeout(()=>{
                                    alert('you lost!');
                                },500);
                               ShowBombs();
                            }
                            //else check if won and keep opening cells if not
                            else {
                                // reveale cell in js
                                openCells(row,column);
                                // reveale cell in UI
                                renderCells();

                                win = CheckIfWin();
                                if(win) 
                                    alert('ale ale winner');
                            }

                         
                        }
                        // if rightclick on cell
                        else if(clickEvent == 'contextmenu') 
                        {

                            // pevent the properties bar to pop up when right click on cell
                            e.preventDefault();
                            let eventCell;
                            if(e.target.localName == 'i')
                               { eventCell = e.target.parentElement;}
                            else { eventCell = e.target;}

                            if(!eventCell.hasAttribute('clicksNum')) {
                                let att = document.createAttribute("clicksNum");
                                att.value = 0;
                               
                                eventCell.setAttributeNode(att);
                            }
                            let ButtonAttribute = eventCell.getAttributeNode('clicksNum');
                            let NumOfRightClicks = parseInt(ButtonAttribute.nodeValue);
                            console.log(NumOfRightClicks);
                            console.log(ButtonAttribute);
                            
                            if(NumOfRightClicks == 2) 
                            {   
                                eventCell.removeAttribute('clicksNum')
                                
                                eventCell.innerHTML = '';
                            }
                            
                            if(NumOfRightClicks == 1) 
                            {
                                // e.target.setAttribute("class","question");
                                boardRow[column] -= 0.5; // indicate that cell can be clicked
                                eventCell.setAttribute("clicksNum",++NumOfRightClicks);
                                eventCell.innerHTML = '<i class="far fa-question-circle"></i>';
                                
                            }
                            if(NumOfRightClicks == 0) 
                            {
                               
                                eventCell.setAttribute("clicksNum",++NumOfRightClicks);
                                eventCell.innerHTML = `<i class="far fa-flag"></i>`
                                
                                boardRow[column] += 0.5; // indicate that cell can not be clicked
                            }
                            window.b = board;
                            console.log(e);
                            
                        }

                    }
                
            });
        });
    });
}


// end of eventlistener for board buttons

addEventListenersToButtons();

// reveal the bombs in the UI when the user lose
function ShowBombs()
{
    let DomBomb ;
    for (let index = 0; index < minesPositions.length; index++) {
        
        DomBomb = findBombDom(board,minesPositions[index].row,minesPositions[index].col);
        //render bombs in the UI
        renderBomb(DomBomb);
        
    }
}



function findBombDom(board,row,col) {
    // return the DOM element of the bomb cell
    let DomRow = document.querySelector('.tableBoard tbody');
    DomRow = DomRow.children[row-1];
    let DomCol;
    DomCol = DomRow.children[col-1];

    return DomCol;
}

function renderBomb(bombDom) {
    bombDom.innerHTML = `<i class="fas fa-bomb"></i>`;
}

function CheckIfWin() {
    for (let row = 0; row < board.length; row++) {
        boardRow = board[row];
        for (let column = 0; column < boardRow.length; column++) {
            // if there is still unrevealed cells
            if(boardRow[column] >= 10) 
                return 0;
        }
    }

    return 1;
}

function renderCells( ) {
    for (let row = 1; row < board.length - 1 ; row++) {
        boardRow = board[row];
        for (let column = 1; column < boardRow.length - 1; column++) {
            // if the cell is revealed 
            if(boardRow[column] > -1 && boardRow[column]<10 && boardRow[column]!=-5) 
                RenderOpenCell(boardRow[column],row,column);
        }
    }
}

function RenderOpenCell(cellValue, row , col) {
    
    let color;

    switch(cellValue){
        case 1:
            color = "blue";
            break;
        case 2:
            color = "green";
            break;
        case 3:
            color = "red";
            break;
        case 4:
            color = "darkblue";
            break;
        case 5:
            color = "brown";
            break;
        case 6:
            color = "darkgreen";
            break;
        case 7:
            color = "black";
            break;
        case 8:
            color = "gery";
            break;
        default: break;
    }

    let cellDomRow = document.querySelector('.tableBoard tr');

    while(row-1){
        cellDomRow = cellDomRow.nextElementSibling;
        row--;}

    let cellDomCol = cellDomRow.firstElementChild;
    while(col-1){
        cellDomCol = cellDomCol.nextElementSibling;
        col--;
    }

        //for empty cell we insert value of 0 which will keep the DOM table view size
        cellDomCol.innerHTML = `<h4 ${cellValue?'':'class="fixEmptyH4"'}> ${cellValue?cellValue:0} </h4>`;
        if(cellValue)
        cellDomCol.style = `color:${color}`;
    
}


function openCells(row,column) {
    let boardRow = board[row];
    if(boardRow[column]==10) {
            boardRow[column] -= 10;
            for (let i = row-1; i < row+2; i++) {
                for (let j = column-1; j < column+2; j++) {
                    openCells(i,j);
                }
            }
    }
    else if(boardRow[column]>10 && boardRow[column]%1==0) 
        boardRow[column] -= 10;
}

//change later
function CheckYAxix(Ycell) {
    let count = 0;
    while(Ycell){
        count++;
        Ycell = Ycell.previousElementSibling;
    }
    return count;
}

//change later
function CheckXAxix(Xcell) {
    let count = 0;
    while(Xcell){
        count++;
        Xcell = Xcell.previousElementSibling;
    }
    return count;
}

function printBoard(board)
{
    let printedRow;
    for (let row = 0; row < board.length; row++) {
        boardRow = board[row];
        printedRow = '';
        for (let column = 0; column < boardRow.length; column++) {
            if(boardRow[column]<10 && boardRow[column]>-1)
                printedRow += '   ' + boardRow[column];
            else
                printedRow+= ' ' + boardRow[column];
        }
        console.log(printedRow);
    }
}

function ClearBoard() {
    document.querySelector('.tableBoard').innerHTML = EmptyBoard;
}

// reset button funcionality

let start;
let reset = false;
let countResetsCliked = 0;

document.querySelector('.reset').addEventListener('click',e => {
    if(!countResetsCliked){
        alert('you have to play first');
    }
    else if(countResetsCliked && countResetsCliked % 2 == 1)   
    {
        countResetsCliked++;
        initGame();
        ClearBoard();
        countResetsCliked = 0;
        addEventListenersToButtons();
    }
});

function renderTimer() {
    if(!RunTimer)
    {
        countResetsCliked++;
        window.requestAnimationFrame(step);
    }
}


function step(timeStamp) {
    RunTimer = true;
    if(start === undefined)
        start = timeStamp;

    const elsaped = timeStamp - start ;

    let seconds = Math.floor(elsaped/1000);
    if(!lose)
    {
        //render time
        if(seconds<10)
            document.querySelector('.time').innerHTML = '0' + '0' + seconds;
        else {
            if(seconds<100)
                document.querySelector('.time').innerHTML = '0' + seconds;
            else
                document.querySelector('.time').innerHTML = seconds ;
        }

    }

    if(countResetsCliked%2 == 1)
        window.requestAnimationFrame(step);
    else {
        start = undefined;
        document.querySelector('.time').innerHTML = '000';
        RunTimer = false;
        lose = false;
    }

}