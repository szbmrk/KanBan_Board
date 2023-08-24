export const formatDate = (dateString) => {
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.slice(0, 5).split(':');

    const formattedDate = `${year}. ${month}. ${day}. ${hour}:${minute}`;
    return formattedDate;
}