const labelMap = {
    1:{name:'Mask', color:'green'},
    2:{name:'NoMask', color:'red'}
}

export const drawRect = (boxes, classes, scores, threshold, 
        imgWidth, imgHeight, ctx)=>{
    for(let i=0; i<=boxes.length; i++){
        if (boxes[i] && classes[i] && scores[i] > threshold) {

            const [y, x, height, width] = boxes[i]
            const text = classes[i]

            ctx.strokeStyle = labelMap[text]['color']
            ctx.lineWidth = 5  
            ctx.fillStyle = labelMap[text]['color']

            ctx.font = '30px Arial'

            ctx.beginPath()
            ctx.fillText(labelMap[text]['name'] 
            + ' - '
            + Math.round(scores[i] * 100) 
                / 100, x * imgWidth, y * imgHeight - 10)
            ctx.rect(x * imgWidth, y * imgHeight, width * 
                imgWidth / 2, height * imgHeight / 2);


            ctx.stroke()
        }
    }
}


