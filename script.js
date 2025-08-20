document.addEventListener('DOMContentLoaded', () => {
    const playArea = document.getElementById('play-area');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    const controlButtons = document.querySelectorAll('.control-btn');

    const playAreaSize = 300;
    const unitSize = 10;
    let snake = [{ x: 50, y: 50 }];
    let direction = { x: 10, y: 0 }; // Start moving right
    let food = {};
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let gameInterval;
	
	let specialFood=null;
	let specialFoodTimeout;
	let specialFoodDuration=5000;
    let obstacles = [];
    const obstacleCount = 5;

    highScoreDisplay.textContent = `High Score: ${highScore}`;

    // (Removed duplicate createFood)

        function isOnSnakeOrObstacle(x, y, size = unitSize) {
            // Check snake
            for (const segment of snake) {
                if (
                    x < segment.x + unitSize &&
                    x + size > segment.x &&
                    y < segment.y + unitSize &&
                    y + size > segment.y
                ) return true;
            }
            // Check obstacles
            for (const obs of obstacles) {
                if (
                    x < obs.x + obs.size &&
                    x + size > obs.x &&
                    y < obs.y + obs.size &&
                    y + size > obs.y
                ) return true;
            }
            return false;
        }

        function createFood(type = 'ordinary') {
            let size = type === 'special' ? 20 : 10;
            let foodItem;
            do {
                foodItem = {
                    x: Math.floor(Math.random() * ((playAreaSize - size) / unitSize)) * unitSize,
                    y: Math.floor(Math.random() * ((playAreaSize - size) / unitSize)) * unitSize,
                    type: type,
                    size: size
                };
            } while (isOnSnakeOrObstacle(foodItem.x, foodItem.y, size));
            const foodElement = document.createElement('div');
            foodElement.style.left = `${foodItem.x}px`;
            foodElement.style.top = `${foodItem.y}px`;
            foodElement.classList.add('food', `${type}-food`);
            playArea.appendChild(foodElement);

            if (type === 'special') {
                specialFood = foodItem;
                startSpecialFoodTimer(specialFoodDuration);
            } else {
                food = foodItem;
            }
        }

	
	function removeFood(foodItem) {
        const foodElements = document.querySelectorAll(`.${foodItem.type}-food`);
        foodElements.forEach(element => {
        if (parseInt(element.style.left) === foodItem.x && parseInt(element.style.top) === foodItem.y) {
            element.remove();
        }
    });
    }
	
    // (Removed duplicate checkFoodCollision)

        function isHeadOnFood(head, foodItem) {
            // Check overlap for any size food
            return (
                head.x < foodItem.x + foodItem.size &&
                head.x + unitSize > foodItem.x &&
                head.y < foodItem.y + foodItem.size &&
                head.y + unitSize > foodItem.y
            );
        }

        function checkFoodCollision(head) {
            if (isHeadOnFood(head, food)) {
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
                removeFood(food);
                createFood('ordinary');
            } else if (specialFood && isHeadOnFood(head, specialFood)) {
                score += 5; // Special food gives more points
                scoreDisplay.textContent = `Score: ${score}`;
                clearInterval(specialFoodTimeout);
                removeFood(specialFood);
                specialFood = null;
                document.getElementById('special-food-timer').style.display = 'none';
            } else {
                snake.pop();
            }
        }




    function moveSnake() {
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        snake.unshift(head);
        checkFoodCollision(head);
    }

        function createObstacles() {
            obstacles = [];
            for (let i = 0; i < obstacleCount; i++) {
                let obs;
                do {
                    obs = {
                        x: Math.floor(Math.random() * ((playAreaSize - 20) / unitSize)) * unitSize,
                        y: Math.floor(Math.random() * ((playAreaSize - 20) / unitSize)) * unitSize,
                        size: 20
                    };
                } while (isOnSnakeOrObstacle(obs.x, obs.y, obs.size));
                obstacles.push(obs);
            }
        }

        function drawObstacles() {
            document.querySelectorAll('.obstacle').forEach(o => o.remove());
            for (const obs of obstacles) {
                const obsElem = document.createElement('div');
                obsElem.className = 'obstacle';
                obsElem.style.left = `${obs.x}px`;
                obsElem.style.top = `${obs.y}px`;
                obsElem.style.width = `${obs.size}px`;
                obsElem.style.height = `${obs.size}px`;
                playArea.appendChild(obsElem);
            }
        }
	
function startSpecialFoodTimer(duration) {
    const timerElement = document.getElementById('special-food-timer');
    timerElement.style.display = 'block';
    let timeLeft = duration / 1000;

    const countdown = setInterval(() => {
        timerElement.textContent = `Special Food Disappears In: ${timeLeft}s`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(countdown);
            timerElement.style.display = 'none';
            removeFood(specialFood);
            specialFood = null;
        }
    }, 1000);
}


    function drawSnake() {
    // Remove old snake parts only, not food
    document.querySelectorAll('.snake').forEach(segment => segment.remove());

    snake.forEach((segment, index) => {
        const snakeElement = document.createElement('div');
        snakeElement.style.left = `${segment.x}px`;
        snakeElement.style.top = `${segment.y}px`;

        if (index === 0) {
            snakeElement.classList.add('snake', 'snake-head');
        } else if (index === snake.length - 1) {
            snakeElement.classList.add('snake', 'snake-tail');
        } else {
            snakeElement.classList.add('snake');
        }
        playArea.appendChild(snakeElement);
    });
}
        function drawObstacles() {
            document.querySelectorAll('.obstacle').forEach(o => o.remove());
            for (const obs of obstacles) {
                const obsElem = document.createElement('div');
                obsElem.className = 'obstacle';
                obsElem.style.left = `${obs.x}px`;
                obsElem.style.top = `${obs.y}px`;
                obsElem.style.width = `${obs.size}px`;
                obsElem.style.height = `${obs.size}px`;
                playArea.appendChild(obsElem);
            }
        }

    function checkCollision() {
        const head = snake[0];

        if (
            head.x < 0 || head.x >= playAreaSize ||
            head.y < 0 || head.y >= playAreaSize ||
            snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            clearInterval(gameInterval);
            alert('Game Over!');
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
                highScoreDisplay.textContent = `High Score: ${highScore}`;
            }
            resetGame();
        }
            // Obstacle collision
            for (const obs of obstacles) {
                if (
                    head.x < obs.x + obs.size &&
                    head.x + unitSize > obs.x &&
                    head.y < obs.y + obs.size &&
                    head.y + unitSize > obs.y
                ) {
                    clearInterval(gameInterval);
                    alert('Game Over! (Hit an obstacle)');
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('highScore', highScore);
                        highScoreDisplay.textContent = `High Score: ${highScore}`;
                    }
                    resetGame();
                    return;
                }
            }
    }

    function updateGame() {
        moveSnake();
        drawSnake();
        checkCollision();
    }
        function updateGame() {
            moveSnake();
            drawObstacles();
            drawSnake();
            checkCollision();
        }

    function resetGame() {
        snake = [{ x: 50, y: 50 }];
        direction = { x: 10, y: 0 }; // Move right at start
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        playArea.innerHTML = ''; // Clear everything
        createFood();
        drawSnake();
        clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, 200);
    }
        function resetGame() {
            snake = [{ x: 50, y: 50 }];
            direction = { x: 10, y: 0 }; // Move right at start
            score = 0;
            scoreDisplay.textContent = `Score: ${score}`;
            playArea.innerHTML = '';
            createObstacles();
            createFood();
            drawObstacles();
            drawSnake();
            clearInterval(gameInterval);
            gameInterval = setInterval(updateGame, 200);
        }

    function changeDirection(event) {
        const keyPressed = event.key;
        const directions = {
            ArrowUp: { x: 0, y: -unitSize },
            ArrowDown: { x: 0, y: unitSize },
            ArrowLeft: { x: -unitSize, y: 0 },
            ArrowRight: { x: unitSize, y: 0 },
        };

        if (directions[keyPressed]) {
            const newDirection = directions[keyPressed];
            if (newDirection.x !== -direction.x || newDirection.y !== -direction.y) {
                direction = newDirection;
            }
        }
    }

    controlButtons.forEach(button => {
        button.addEventListener('click', () => {
            const directionMap = {
                up: { x: 0, y: -unitSize },
                down: { x: 0, y: unitSize },
                left: { x: -unitSize, y: 0 },
                right: { x: unitSize, y: 0 },
            };

            const newDirection = directionMap[button.getAttribute('data-direction')];
            if (newDirection.x !== -direction.x || newDirection.y !== -direction.y) {
                direction = newDirection;
            }
        });
    });

    document.addEventListener('keydown', changeDirection);
    resetGame();
	
	
	// Function to create special food at regular intervals
function spawnSpecialFood() {
    if (!specialFood) {
        createFood('special');
        startSpecialFoodTimer(specialFoodDuration);
    }
}

// Set interval to spawn special food every 10 seconds
let specialFoodInterval = setInterval(spawnSpecialFood, 10000);

});
