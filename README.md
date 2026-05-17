# Algorithm Visualizer

Interactive visualization of sorting and searching algorithms with AI chat support.

## Project Structure

```
src/
├── constants/
│   └── colors.js              # Color palette (C object)
├── algorithms/
│   └── index.js               # Binary Search, Bubble Sort, Selection Sort
├── components/
│   ├── UI.jsx                 # Shared UI components (Label, Button, etc.)
│   ├── BinarySearch.jsx       # Binary Search visualizer
│   ├── SortVisualizer.jsx     # Bubble & Selection Sort visualizer
│   └── AIChat.jsx             # AI Chat component
├── App.jsx                    # Main application component
├── main.jsx                   # React entry point
├── index_new.html             # HTML entry point
├── package.json               # Dependencies
└── vite.config.js             # Vite configuration
```

## Features

- **Binary Search Visualizer** - Step-by-step visualization of binary search algorithm
- **Bubble Sort Visualizer** - See how bubble sort works interactively
- **Selection Sort Visualizer** - Visualize selection sort algorithm
- **AI Chat** - Ask questions about algorithms and programming without an API key through Puter.js
- **Playback Controls** - Play, pause, step forward/backward, reset, and adjust speed

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

This will start a development server at `http://localhost:3000`

## Build

```bash
npm run build
```

## Components Overview

### `constants/colors.js`
Centralized color palette used throughout the application.

### `algorithms/index.js`
Pure functions that generate step-by-step data for each algorithm:
- `binarySteps(arr, target)` - Returns steps for binary search
- `bubbleSteps(arr)` - Returns steps for bubble sort
- `selectionSteps(arr)` - Returns steps for selection sort

### `components/UI.jsx`
Reusable UI components:
- `Label` - Form label component
- `TInput` - Text input field
- `Btn` - Button component
- `Msg` - Message display box
- `Controls` - Playback controls [prev, play/pause, next, reset, speed]
- `Lgd` - Legend component
- `SectionHead` - Section header with title and description

### `components/BinarySearch.jsx`
Standalone binary search visualizer with input controls and array visualization.

### `components/SortVisualizer.jsx`
Reusable sorting visualizer used for both Bubble Sort and Selection Sort.

### `components/AIChat.jsx`
Chat interface powered by Puter.js AI. It runs directly from the browser and does not require an API key.

### `App.jsx`
Main application component with tab navigation and layout management.
