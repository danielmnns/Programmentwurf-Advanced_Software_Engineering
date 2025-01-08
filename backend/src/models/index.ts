class Course {
    constructor(
        public id: number,
        public title: string,
        public description: string,
        public duration: number,
    ) {}

    validate() {
        if (!this.title || !this.description || this.duration <= 0) {
            throw new Error('Invalid course data');
        }
    }
}

export { Course };