const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((acc, current) => acc + current.likes, 0)
}

const favoriteBlog  = (blogs) => {
    const favorite = Math.max(...blogs.map(blog => blog.likes))
    return blogs.find(blog => blog.likes === favorite)
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}