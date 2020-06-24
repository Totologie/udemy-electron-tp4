const { app, BrowserWindow, ipcMain, shell }= require ('electron')
const  ffmpeg  = require('fluent-ffmpeg')
const _ = require('lodash')

let mainWindow

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: { 
            nodeIntegration: true, 
            backgroundThrottling: false
        }
    })
    mainWindow.loadFile('src/index.html')
})

ipcMain.on('videos:added', (event, videos) => {
    const promises = _.map(videos, video => {
        return new Promise( (resolve, reject) => {
            /*ffmpeg.ffprobe(videos[0].path, (err, metadata) => {
                console.log(err)
                console.log(metadata)
            })*/

            const metadata = { name: 'blabla', format: {duration: '3.55', codec: 'avi'}, test: 'blabla'}
            setTimeout( ( () => 
                resolve({
                    ...video, 
                    duration: metadata.format.duration,
                    format: 'avi'
                })
            ), getRandomDelay())

            setTimeout( ( () => reject(metadata) ), 4500 )
        })
    })
    Promise.all(promises)
        .then((results) => {
            mainWindow.webContents.send('metadata:complete', results)
        })
})

ipcMain.on('conversion:start', (event, videos) => {
    /*const keyName = Object.keys(videos)
    const video = videos[keyName]*/

    _.each(videos, video => {
        const outputDirectory = video.path.split(video.name) [0]
        const outputName = video.name.split('.')[0]
        const outputPath = `${outputDirectory}${outputName}.${video.format}`
        console.log(video)

        let timemark = 0.00
        let interval = setInterval( (()=> {
            timemark ++
            console.log({ ...video, timemark })

            mainWindow.webContents.send('conversion:progress', { video, timemark })
        }), 1000)

        setTimeout( ( () => {
            clearInterval(interval)
            interval = null

            mainWindow.webContents.send('conversion:end', { video, outputPath })
        }
        ), 3500)
    })

    /*ffmpeg(video.path)
        .output(outputPath)
        .on('end', () => console.log('Conversion complete !'))
        .run()*/
})

ipcMain.on('folder:open', (event, outputPath) => {
    shell.showItemInFolder(outputPath) //Ne fonctionne pas car pas de véritable conversion donc pas de fichier
})

function getRandomDelay(){
    return Math.floor(Math.random() * 3000)
}