class Node {

    constructor(value){
        this.value = value;
        this.next = undefined;
    }

    clear(){

        // Remove value
        this.value = undefined;

        // If node has a neighbour
        if(this.next) {

            // Recursively clear
            this.next.clear();
            this.next = undefined;
        }
    }
}

class LinkedList {
    constructor(){
        this.head = {next: undefined};
        this.length = 0;
    }

    // Append value to the end of the list
    add(value) {
        let element = this.head;
        while(element.next) element = element.next;
        element.next = new Node(value);
        this.length++;
    }

    remove(value) {
        let element = this.head;
        while(element.next) {
            if(element.next.value === value) {
                const temp = element.next;
                element.next = element.next.next;
                this.length--;
                temp.value = undefined;
                temp.next = undefined;
                break;
            }
            element = element.next;
        }
    }

    clear() {
        let head = this.head;

        // If head element has a neighbour
        if(head.next){

            // Clear the neighbour recursively
            head.next.clear();
            head.next = undefined;
        }

    }

    forEach(callback) {
        let element = this.head;
        while(element.next) {
            element = element.next;
            callback(element.value);
        }
    }

}

export default LinkedList;