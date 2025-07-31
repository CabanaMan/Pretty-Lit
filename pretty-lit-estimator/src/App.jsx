import { useState, useEffect, useRef } from 'react'
import { fabric } from 'fabric'
import './App.css'
/* eslint-disable react-hooks/exhaustive-deps */

function App() {
  const canvasRef = useRef(null)
  const [canvas, setCanvas] = useState(null)
  const [brushSize, setBrushSize] = useState(10)
  const [spacing, setSpacing] = useState(12)
  const [lineType, setLineType] = useState('gutter')
  const [counts, setCounts] = useState({ gutter: 0, roof: 0, bush: 0 })
  const [estimate, setEstimate] = useState('0.00')

  // initialize fabric canvas once
  useEffect(() => {
    const c = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: 'white'
    })
    c.freeDrawingBrush.width = brushSize
    setCanvas(c)
    return () => c.dispose()
  }, [])

  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.width = brushSize
    }
  }, [brushSize, canvas])

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file || !canvas) return
    const reader = new FileReader()
    reader.onload = () => {
      fabric.Image.fromURL(reader.result, (img) => {
        const scale = Math.min(
          canvas.getWidth() / img.width,
          canvas.getHeight() / img.height
        )
        img.scale(scale)
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas))
      })
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (!canvas) return
    const listener = (e) => {
      if (e.target && e.target.type === 'path') {
        setCounts((prev) => ({
          ...prev,
          [lineType]: prev[lineType] + 1
        }))
      }
    }
    canvas.on('path:created', listener)
    return () => {
      canvas.off('path:created', listener)
    }
  }, [canvas, lineType])

  useEffect(() => {
    const ft = spacing / 12
    const cost =
      counts.gutter * ft * 7 + counts.roof * ft * 8 + counts.bush * ft * 5
    setEstimate(cost.toFixed(2))
  }, [counts, spacing])

  const exportImage = () => {
    if (!canvas) return
    const data = canvas.toDataURL({ format: 'png' })
    const link = document.createElement('a')
    link.href = data
    link.download = 'layout.png'
    link.click()
  }

  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <h1>Pretty Lit Estimator</h1>
      <div>
        <input type="file" accept="image/png,image/jpeg" onChange={handleUpload} />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <label>
          Bulb Size:
          <input
            type="range"
            min="5"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
          />
          {brushSize}px
        </label>
      </div>
      <div>
        <label>
          Spacing:
          <select
            value={spacing}
            onChange={(e) => setSpacing(parseInt(e.target.value))}
          >
            <option value="12">12 inches</option>
            <option value="15">15 inches</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Line Type:
          <select
            value={lineType}
            onChange={(e) => setLineType(e.target.value)}
          >
            <option value="gutter">Gutter</option>
            <option value="roof">Pitched Roof</option>
            <option value="bush">Bush/Ground</option>
          </select>
        </label>
      </div>
      <canvas
        ref={canvasRef}
        width="800"
        height="600"
        style={{ border: '1px solid #ccc', marginTop: '1rem', touchAction: 'none' }}
      />
      <div style={{ marginTop: '1rem' }}>
        <button onClick={exportImage}>Export PNG</button>
      </div>
      <div style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
        Estimated Cost: ${estimate}
      </div>
    </div>
  )
}

export default App
