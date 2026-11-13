# Pomodoro Focus Timer

A small frontend timer for focused work sessions and breaks. It is built with plain HTML, CSS and JavaScript, with no build step, server or external dependency.

## Features

- 25 minute focus sessions
- 5 minute short breaks
- 15 minute long breaks
- Start, pause, reset and skip controls
- Circular progress indicator
- Four-session focus cycle tracking
- Focus session and minute totals saved in browser local storage
- Responsive desktop and mobile layout

## Files

- `index.html` - page structure and timer controls
- `styles.css` - responsive layout, progress ring and visual design
- `script.js` - timer state, mode switching, cycle progress and saved statistics

## How to run

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Choose a mode, start the timer and work through the focus cycle.

No account, package install or server is required.

## How it works

The JavaScript stores the selected mode, remaining time and completed focus sessions. The display updates every second, and the circular progress ring shows how much of the current session is complete. Focus totals are saved in local storage so they remain available in the same browser.

## Testing

The project was checked in a browser with functional tests for mode switching, timer controls, countdown behavior, session completion, cycle changes, saved statistics, reset and skip behavior. Desktop and mobile layouts were visually inspected.

## Note

This project was built with the help of an AI assistant (Instinct) as a learning project.
