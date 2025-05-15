// filter.js
$(document).ready(function() {
    const modelOptions = $('#modelFilter optgroup');
    const styleOptions = $('#styleFilter optgroup');

    $('#brandFilter').on('change', function() {
        const selectedBrand = $(this).val();

        if (selectedBrand === "") {
            // Show all models/styles if "All Brands" is selected
            modelOptions.show();
            styleOptions.show();
        } else {
            // Hide all, then show only the selected brand's options
            modelOptions.hide().filter(`[label="${selectedBrand}"]`).show();
            styleOptions.hide().filter(`[label="${selectedBrand}"]`).show();

            // Optionally reset the selected value to default
            $('#modelFilter').val('');
            $('#styleFilter').val('');
        }
    });
});