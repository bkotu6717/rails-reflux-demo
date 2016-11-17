var bulkSelection = (function(){

    var selectedCardsHash = {};
    var selectAllFlag = false;
    var cardsContainer;
    var hasSelectedCards = false;
    var selectAllBtn;
    var cardSelector;
    var getAvailableSelectedCards;
    var bulkActionBar;
    var selectAllLabel = i18n.t("select_all");
    var clearSelectionLabel = i18n.t("clear");

    function init(options){
      cardsContainer = options.cardsContainer;
      selectAllBtn = options.selectAllBtn;
      cardSelector = options.cardSelector;
      getAvailableSelectedCards = options.getAvailableSelectedCards;
      bulkActionBar = options.bulkActionBar;
    }

    function onSelectAllClick(event){
      event.preventDefault();
      event.stopPropagation();
      if(selectAllFlag === false){
        selectAllFlag = true;
        setSelectAllLinkText(clearSelectionLabel);
        selectAllCards();
      }else{
        selectAllFlag = false;
        setSelectAllLinkText(selectAllLabel);
        unSelectAllCards();
      }
      toggleBulkActionBarDisplay();
    }

    function onSelectCard(event){
      event.preventDefault();
      event.stopPropagation();

      var card = $(this);
      var uuid = card.data('uuid');
      selectAllFlag = false;
      setSelectAllLinkText(selectAllLabel);

      if (card.is(':checked')) {
        selectedCardsHash[uuid] = true;
        hasSelectedCards = true;
      } else {
        delete selectedCardsHash[uuid];
        hasSelectedCards = getAvailableSelectedCards(selectedCardsHash).length > 0;
      }
      toggleBulkActionBarDisplay();
    }

    function toggleBulkActionBarDisplay() {
      bulkActionBar[hasSelectedCards ? 'removeClass' : 'addClass']('hide');
    }

    function setSelectAllLinkText(text){
      selectAllBtn.html(text);
    }

    function selectAllCards(){
      $(cardSelector, cardsContainer).each(function(index,element){
        var uuid = $(element).prop("checked",true).data('uuid');
        selectedCardsHash[uuid] = true;
        hasSelectedCards = true;
      });
    }

    function addToSelectedCardsHash(list){
      _.each(list, addCardToSelectedCardsHash);
    }

    function addCardToSelectedCardsHash(item){
      selectedCardsHash[item.uuid] = true;
      hasSelectedCards = true;
    }

    function onCardListDisplay(list){
      hasSelectedCards = false;
      selectAllFlag && addToSelectedCardsHash(list);
      prepareDataToShowSelection(list);
      toggleBulkActionBarDisplay();
    }

    function prepareDataToShowSelection(list){
      _.each(list, function(item){
        if (selectedCardsHash[item.uuid]) {
          item.checked = 'checked';
          hasSelectedCards = true;
        } else {
          item.checked = '';
        }
      });
    }

    function unSelectAllCards(){
      $(cardSelector, cardsContainer).prop("checked",false);
      selectedCardsHash = {};
      hasSelectedCards = false;
    }

    function getSelectAllFlag(){
      return selectAllFlag;
    }

    function getSelectedCardsHash(){
      return selectedCardsHash;
    }

    function removeSelectAll(){
      selectAllFlag = false;
      setSelectAllLinkText(selectAllLabel);
    }

    function setSelectedCardsHash(selectedCards){
      selectedCardsHash = selectedCards
    }

    function clearSelection() {
      removeSelectAll();
      setSelectedCardsHash({});
      $(cardSelector, cardsContainer).prop('checked', false);
    }

    return {
      init: init,
      onSelectAllClick: onSelectAllClick,
      onSelectCard: onSelectCard,
      onCardListDisplay: onCardListDisplay,
      getSelectAllFlag: getSelectAllFlag,
      getSelectedCardsHash: getSelectedCardsHash,
      clearSelection: clearSelection
    }

})();

module.exports = bulkSelection;
