const info = (...params) => {
    if(process.env.NODE_ENV !== 'test') { //avoid logger obstructing the test exectuon
        console.log(...params)
    }
}

const error = (...params) => {
    console.error(...params)
}

module.exports = {
    info, error
}