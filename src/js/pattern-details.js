document.addEventListener('DOMContentLoaded', () => {
    const patternCards = document.querySelectorAll('.pattern-grid .pattern-card');
    const patternDetails = document.querySelectorAll('.pattern-details');

    const closeAllDetails = () => {
        patternDetails.forEach(detail => {
            detail.style.display = 'none';
        });
    };

    patternCards.forEach(card => {
        card.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = card.getAttribute('href').substring(1);
            const targetDetail = document.getElementById(targetId);

            if (targetDetail) {
                closeAllDetails();
                targetDetail.style.display = 'block';
                targetDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    patternDetails.forEach(detail => {
        const closeButton = detail.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                detail.style.display = 'none';
            });
        }
    });
}); 