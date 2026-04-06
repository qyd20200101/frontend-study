
    let modal = document.getElementById("myModal");

    let img = document.getElementById("myImg");
    let modalImg = document.getElementById("img01");
    let captionText = document.getElementById("caption");
    
    img.onclick = function() {
        modal.style.display = "block";
        modalImg.src = this.src;
        modalImg.alt = this.art;
        captionText.innerHTML = this.alt;
        return console.log("成功");
        
    }
    // 获取<span>标签,设置关闭模态框按钮
    let span = document.getElementsByClassName("close")[0];
    console.log(span);
    

    // 点击span元素上的x,关闭模态框
    span.onclick = function(){
        modal.style.display = "none";
    }