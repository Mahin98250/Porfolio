console.log('Mahin Portfolio Loaded');

window.addEventListener('scroll',()=>{
  const header=document.querySelector('header');

  if(window.scrollY>50){
    header.style.background='rgba(2,6,23,0.95)';
  }else{
    header.style.background='rgba(2,6,23,0.8)';
  }
});