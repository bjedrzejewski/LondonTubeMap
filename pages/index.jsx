const React = require('react')

class Index extends React.Component {
    constructor(props) {
        super(props)
        this.svgObject = React.createRef()
        this.width = 600
    }

    render = () => {
        return <div>
            <object type="image/svg+xml" data="/static/tubemap.svg" ref={this.svgObject} onLoad={this.svgObjectLoad} onKeyPress={this.handleKeyPress}>
                Your browser does not support SVG
            </object>
        </div>
    }

    handleKeyPress = (ev) => {
        console.log(`keypress ${ev.key}`)
        if (ev.key === 'ArrowUp') {
            this.svgMoveViewPort(0, -10)
        } else if (ev.key === 'ArrowDown') {
            this.svgMoveViewPort(0, 10)
        } else if (ev.key === 'ArrowLeft') {
            this.svgMoveViewPort(-10, 0)
        } else if (ev.key === 'ArrowRight') {
            this.svgMoveViewPort(10, 0)
        }
    }

    svgGetViewport= () => {
        const svg = this.svgObject.current.contentDocument.querySelector('svg')
        let viewbox = svg.getAttribute('viewBox')
        let dim = (viewbox || '').split(' ').map(parseFloat)
        if (!this.minX) {
            this.minX = dim[0]
            this.minY = dim[1]
            this.maxX = dim[2] + dim[0]
            this.maxY = dim[3] + dim[1]
            console.log(this)
        }
        return dim;
    }

    svgObjectLoad = () => {
        console.log('svgObjectLoad')
        this.resizeSVG()
    }

    svgMoveViewPort = (moveX, moveY) => {
        console.log('svgMoveViewPort')

        let dim = this.svgGetViewport()
        if (dim[0] + moveX < this.minX) moveX = this.minX - dim[0]
        if (dim[1] + moveY < this.minY) moveY = this.minY - dim[1]
        if (dim[0] + dim[2] + moveX > this.maxX) moveX = this.maxX - dim[0] - dim[2]
        if (dim[1] + dim[3] + moveY > this.maxY) moveY = this.maxY - dim[1] - dim[3]

        const svg = this.svgObject.current.contentDocument.querySelector('svg')
        svg.setAttribute('viewBox', `${dim[0] + moveX} ${dim[1] + moveY} ${dim[2]} ${dim[3]}`)

        // Eval closeness to target
        // Post back to AWS Kinesis
    }

    resizeSVG = () => {
        console.log('resizeSVG')
        const current = this.svgObject.current

        current.height = window.innerHeight - 50
        current.width = window.innerWidth - 50
        const bBox = [current.width, current.height]

        const svg = current.contentDocument.querySelector('svg')
        if (svg) {
            let dim = this.svgGetViewport()
            svg.setAttribute('viewBox', `${dim[0]} ${dim[1]} ${this.width} ${this.width * bBox[1] / bBox[0]}`)
            console.log(svg.getAttribute('viewBox'))
        }

        this.gamma = undefined
    }

    componentDidMount = () => {
        window.addEventListener('resize', this.resizeSVG)
        this.resizeSVG()

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (ev) => {
                if (!this.gamma) {
                    this.beta = ev.beta
                    this.gamma = ev.gamma
                }

                if (ev.gamma - this.gamma > 10) this.svgMoveViewPort(5 + (ev.gamma - this.gamma) / 80 * 20, 0)
                if (ev.gamma - this.gamma < -10) this.svgMoveViewPort(-5 + (ev.gamma - this.gamma) / 80 * 20, 0)
                if (ev.beta - this.beta > 10) this.svgMoveViewPort(0, -(5 + (ev.beta - this.beta) / 80 * 20))
                if (ev.beta - this.beta < -10) this.svgMoveViewPort(0, -(-5 + (ev.beta - this.beta) / 80 * 20))
            })
         }
        window.addEventListener('keydown', this.handleKeyPress)
    }

    componentWillUnmount = () => {
    }
}

export default Index