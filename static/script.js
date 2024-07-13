    document.addEventListener('DOMContentLoaded', function () {
        const questionButton = document.getElementById('question_button');
        const paperButton = document.getElementById('paper_button');
        const questionForm = document.getElementById('question_form');
        const paperForm = document.getElementById('paper_form');
        const subjectSelect = document.getElementById('subject');
        const topicSelect = document.getElementById('topic');
        const yearSelect = document.getElementById('year');
        const otherYearDiv = document.getElementById('other_year_div');
        const config = JSON.parse(document.getElementById('config').textContent);


        const questionFile = document.getElementById('questionFile');

        questionButton.addEventListener('click', function() {
            questionForm.style.display = 'block';
            paperForm.style.display = 'none';
        });

        paperButton.addEventListener('click', function() {
            questionForm.style.display = 'none';
            paperForm.style.display = 'block';
        });
        function populateTopics(subjectName) {
            topicSelect.innerHTML = '';
            config.NEB.subjects.forEach(subject => {
                if (subject.name === subjectName) {
                    subject.topics.forEach(topic => {
                        let option = document.createElement('option');
                        option.value = topic;
                        option.textContent = topic;
                        topicSelect.appendChild(option);
                    });
                }
            });
        }

        subjectSelect.addEventListener('change', function () {
            populateTopics(this.value);
        });

        // Initialize topics for the default selected subject
        populateTopics(subjectSelect.value);

        yearSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                otherYearDiv.style.display = 'block';
            } else {
                otherYearDiv.style.display = 'none';
            }
        });
    });





    function base64ToUint8Array(base64) {
        var binaryString = atob(base64);
        var len = binaryString.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    function decompressData(compressedData) {
        var data = base64ToUint8Array(compressedData);
        var decompressedData = pako.inflate(data);
        return decompressedData;
    }

    function uint8ArrayToBase64(uint8Array) {
        var binary = '';
        var len = uint8Array.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
    }

    document.addEventListener("DOMContentLoaded", function() {
        var compressedData = document.getElementById('compressedData').textContent;

        try {
            var decompressedData = decompressData(compressedData);
            var base64DecompressedData = uint8ArrayToBase64(decompressedData);

            var imgElement = document.getElementById('questionImage');
            imgElement.src = "data:image/png;base64," + base64DecompressedData;

            var pdfElement = document.getElementById('embedPdf');
            pdfElement.data = "data:application/pdf;base64," + base64DecompressedData;

            var downloadLink = document.getElementById('downloadPdf');
            downloadLink.href = "data:application/pdf;base64," + base64DecompressedData;

        } catch (e) {
            console.error("Decompression error: ", e);
        }
    });