import { useEffect, useRef } from "react";
import { init } from 'app/(categories)/computational-design/protein-earrings/initThree.js'
import styles from 'styles/pages/computational.module.css'

export default function Canvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) {
            // Create a new canvas element
            const canvas = document.createElement('canvas');
            canvas.id = 'canvas';
            // canvas.className = styles.mainCanvas;
      
            // Append the canvas to the container element
            const canvasContainer = document.getElementById('canvas-container');
            console.log(canvasContainer);
            if (canvasContainer) {
              canvasContainer.appendChild(canvas);
            }

            init();
        }
    }, []);

    return null;
  }